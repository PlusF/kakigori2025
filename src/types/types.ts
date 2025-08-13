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
