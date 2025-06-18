export type MenuItemCreateBody = {
  name: string;
  description: string;
  price: number;
  tags?: string[];
  categoryId?: string;
  visible?: boolean;
  available?: boolean;
};