export type OrderItem = {
  menuItemId: string;
  quantity: number;
  MenuItem: MenuItem;
};

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  sortOrder: number;
  image: string;
};

export type Summary = {
  totalSales: number;
  totalOrders: number;
  totalQuantity: number;
  popularItems: { name: string; quantity: number }[];
};
