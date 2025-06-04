export type Category = {
  id: number;
  title: string;
  image: string;
  type?: 'gaming' | 'regular';
  parentId?: number | null;
  children?: Category[];
  category: Category | null;
  showProducts: boolean;
};


