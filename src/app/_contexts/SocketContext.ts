"use client";

import { createContext } from "react";
import { Socket } from "socket.io-client";
import { Prisma } from "@prisma/client";

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
  summary: {
    totalSales: number;
    totalOrders: number;
  };
}>({
  socket: null,
  orders: [],
  summary: {
    totalSales: 0,
    totalOrders: 0,
  },
});
