export type MenuResponse = {
  id: string;
  name: string;
  items: {
    id: string;
    name: string;
    description: string;
    price: number;
    visible: boolean;
    available: boolean;
    tags: string[];
  }[];
};

export type MenuCreateBody = {
  name: string;
  isActive?: boolean;
};

export type MenuCreateFullBody = {
  name: string;
  isActive?: boolean;
  itemIds: string[];
};
