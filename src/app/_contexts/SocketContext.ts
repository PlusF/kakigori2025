"use client";

import { createContext } from "react";
import { Socket } from "socket.io-client";
import { Prisma } from "@prisma/client";
import { Summary } from "@/types/types";

export const SocketContext = createContext<{
  socket: Socket | null;
  orders: Prisma.OrderGetPayload<{
    include: {
      OrderItem: {
        include: {
          MenuItem: true;
        };
      };
    };
  }>[];
  summary: Summary;
}>({
  socket: null,
  orders: [],
  summary: {
    totalSales: 0,
    totalOrders: 0,
    totalQuantity: 0,
    popularItems: [],
  },
});
