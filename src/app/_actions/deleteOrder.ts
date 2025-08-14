"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrders } from "./getOrders";

export async function deleteOrder(orderId: string) {
  await prisma.orderItem.deleteMany({
    where: { orderId },
  });

  await prisma.order.delete({
    where: { id: orderId },
  });

  revalidatePath("/");
  revalidatePath("/order");
  revalidatePath("/order-history");
  return getOrders();
}
