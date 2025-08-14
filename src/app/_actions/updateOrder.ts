"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrders } from "./getOrders";

export async function updateOrder(
  orderId: string,
  orderItems: { menuItemId: string; quantity: number }[]
) {
  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: {
        in: orderItems.map(item => item.menuItemId),
      },
    },
  });

  const total = orderItems.reduce((acc, item) => {
    const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
    return acc + (menuItem ? menuItem.price * item.quantity : 0);
  }, 0);

  await prisma.orderItem.deleteMany({
    where: { orderId },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: {
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
  return getOrders();
}