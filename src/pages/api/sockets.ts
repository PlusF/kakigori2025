import type { NextApiRequest, NextApiResponse } from "next";

import type { Socket as NetSocket } from "net";
import type { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { prisma } from "@/lib/prisma";
import { OrderItem, Summary } from "@/types/types";
import cors from "cors";
import { Prisma } from "@prisma/client";

type OrderItemWithMenuItem = Prisma.OrderItemGetPayload<{
  include: {
    MenuItem: true;
  };
}>;

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    OrderItem: {
      include: {
        MenuItem: true;
      };
    };
  };
}>;

// Next.jsの型定義を拡張してSocket.IOの型定義を追加
type ReseponseWebSocket = NextApiResponse & {
  socket: NetSocket & { server: HttpServer & { io?: SocketServer } };
};

// サマリー情報を生成する共通関数
function createSummary(orders: OrderWithItems[]): Summary {
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

  const totalSales = orders.reduce(
    (acc, order) =>
      acc +
      order.OrderItem.reduce(
        (acc, item) => acc + item.MenuItem.price * item.quantity,
        0
      ),
    0
  );

  return {
    totalSales,
    totalOrders: orders.length,
    totalQuantity,
    popularItems,
  };
}

const corsMiddleware = cors();

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
    path: "/api/sockets",
    transports: ["polling", "websocket"],
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // クライアントが接続してきたら、コネクションを確立する
  io.on("connection", async (socket) => {
    const clientId = socket.id;
    console.log(`A client connected. ID: ${clientId}`);

    // 注文の更新を処理
    socket.on("updateOrder", async (data) => {
      console.log("updateOrder", data);
      try {
        // 既存の注文アイテムを削除
        await prisma.orderItem.deleteMany({
          where: { orderId: data.id },
        });

        // 新しい注文アイテムを作成
        await prisma.order.update({
          where: { id: data.id },
          data: {
            total: data.total,
            OrderItem: {
              create: data.OrderItem.map((item: OrderItemWithMenuItem) => ({
                id: crypto.randomUUID(),
                menuItemId: item.menuItemId,
                quantity: item.quantity,
              })),
            },
          },
        });

        // 更新後の全注文を取得して配信
        const orders = await prisma.order.findMany({
          include: {
            OrderItem: {
              include: {
                MenuItem: true,
              },
            },
          },
        });

        const summary = createSummary(orders);
        io.emit("order", { orders, summary });
      } catch (error) {
        console.error("Error updating order:", error);
      }
    });

    // 注文の削除を処理
    socket.on("deleteOrder", async (data) => {
      console.log("deleteOrder", data);
      try {
        // 注文アイテムを削除（カスケード削除の設定がない場合）
        await prisma.orderItem.deleteMany({
          where: { orderId: data.orderId },
        });

        // 注文を削除
        await prisma.order.delete({
          where: { id: data.orderId },
        });

        // 削除後の全注文を取得して配信
        const orders = await prisma.order.findMany({
          include: {
            OrderItem: {
              include: {
                MenuItem: true,
              },
            },
          },
        });

        const summary = createSummary(orders);
        io.emit("order", { orders, summary });
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    });

    // メッセージを受信したら、全クライアントに送信する
    socket.on("order", async (data) => {
      console.log("order", data);
      try {
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
        const summary = createSummary(orders);
        io.emit("order", { orders, summary });
      } catch (error) {
        console.error("Error creating order:", error);
      }
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

    const summary = createSummary(orders);
    io.emit("order", { orders, summary });
  });

  corsMiddleware(req, res, () => {
    res.socket.server.io = io;
    res.end();
  });
}
