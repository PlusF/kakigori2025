"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOrder(
  orderItems: { menuItemId: string; quantity: number }[]
) {
  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: {
        in: orderItems.map((item) => item.menuItemId),
      },
      isActive: true,
    },
  });

  const total = orderItems.reduce((acc, item) => {
    const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
    return acc + (menuItem ? menuItem.price * item.quantity : 0);
  }, 0);

  await prisma.order.create({
    data: {
      id: crypto.randomUUID(),
      total,
      OrderItem: {
        create: orderItems.map((item) => ({
          id: crypto.randomUUID(),
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/order");
  revalidatePath("/order-history");
}
