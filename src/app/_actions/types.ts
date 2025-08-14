import { Prisma } from "@prisma/client";

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    OrderItem: {
      include: {
        MenuItem: true;
      };
    };
  };
}>;