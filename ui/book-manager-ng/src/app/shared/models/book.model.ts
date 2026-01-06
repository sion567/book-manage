export interface Book {
  id: number;
  title: string;
  author: string;
  category?: Category;
  price: number;
  available: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface BookRequest {
  title: string;
  author: string;
  isbn: string;
  price: number;
  categoryId: number;
  publicationDate: string;
}
