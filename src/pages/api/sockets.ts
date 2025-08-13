import type { NextApiRequest, NextApiResponse } from "next";

import type { Socket as NetSocket } from "net";
import type { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { prisma } from "@/lib/prisma";
import { OrderItem } from "@/types/types";

// Next.jsの型定義を拡張してSocket.IOの型定義を追加
type ReseponseWebSocket = NextApiResponse & {
  socket: NetSocket & { server: HttpServer & { io?: SocketServer } };
};

// Next.jsのAPIルーティングの入り口となる関数
export default function SocketHandler(
  req: NextApiRequest,
  res: ReseponseWebSocket
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }
  if (res.socket.server.io) {
    return res.send("already-set-up");
  }
  // Socket.IOのサーバーを作成する
  const io = new SocketServer(res.socket.server, {
    addTrailingSlash: false,
  });

  // クライアントが接続してきたら、コネクションを確立する
  io.on("connection", async (socket) => {
    const clientId = socket.id;
    console.log(`A client connected. ID: ${clientId}`);

    // メッセージを受信したら、全クライアントに送信する
    socket.on("order", async (data) => {
      console.log("order", data);
      const result = await prisma.order.create({
        data: {
          id: crypto.randomUUID(),
          total: data.orderItems.reduce(
            (acc: number, item: OrderItem) =>
              acc + item.MenuItem.price * item.quantity,
            0
          ),
          OrderItem: {
            create: data.orderItems.map((item: OrderItem) => ({
              id: crypto.randomUUID(),
              menuItemId: item.menuItemId,
              quantity: item.quantity,
            })),
          },
        },
      });
      console.log("result", result);
      const orders = await prisma.order.findMany({
        include: {
          OrderItem: {
            include: {
              MenuItem: true,
            },
          },
        },
      });
      // Calculate popular items
      const itemSales: Record<string, { name: string; quantity: number }> = {};
      orders.forEach((order) => {
        order.OrderItem.forEach((item) => {
          const menuItemId = item.menuItemId;
          if (!itemSales[menuItemId]) {
            itemSales[menuItemId] = {
              name: item.MenuItem.name,
              quantity: 0,
            };
          }
          itemSales[menuItemId].quantity += item.quantity;
        });
      });
      
      const popularItems = Object.values(itemSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3);

      const totalQuantity = orders.reduce(
        (acc, order) =>
          acc + order.OrderItem.reduce((sum, item) => sum + item.quantity, 0),
        0
      );

      const summary = {
        totalSales: orders.reduce(
          (acc, order) =>
            acc +
            order.OrderItem.reduce(
              (acc, item) => acc + item.MenuItem.price * item.quantity,
              0
            ),
          0
        ),
        totalOrders: orders.length,
        totalQuantity,
        popularItems,
      };
      io.emit("order", { orders, summary });
    });

    // クライアントが切断した場合の処理
    socket.on("disconnect", () => {
      console.log("A client disconnected.");
    });

    const orders = await prisma.order.findMany({
      include: {
        OrderItem: {
          include: {
            MenuItem: true,
          },
        },
      },
    });
    
    // Calculate popular items
    const itemSales: Record<string, { name: string; quantity: number }> = {};
    orders.forEach((order) => {
      order.OrderItem.forEach((item) => {
        const menuItemId = item.menuItemId;
        if (!itemSales[menuItemId]) {
          itemSales[menuItemId] = {
            name: item.MenuItem.name,
            quantity: 0,
          };
        }
        itemSales[menuItemId].quantity += item.quantity;
      });
    });
    
    const popularItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);

    const totalQuantity = orders.reduce(
      (acc, order) =>
        acc + order.OrderItem.reduce((sum, item) => sum + item.quantity, 0),
      0
    );

    io.emit("order", {
      orders,
      summary: {
        totalSales: orders.reduce(
          (acc, order) =>
            acc +
            order.OrderItem.reduce(
              (acc, item) => acc + item.MenuItem.price * item.quantity,
              0
            ),
          0
        ),
        totalOrders: orders.length,
        totalQuantity,
        popularItems,
      },
    });
  });

  res.socket.server.io = io;
  res.end();
}
