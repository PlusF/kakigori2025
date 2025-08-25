"use server";

import { prisma } from "@/lib/prisma";

export const getMenu = async () => {
  const menu = await prisma.menuItem.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
  return menu;
};
