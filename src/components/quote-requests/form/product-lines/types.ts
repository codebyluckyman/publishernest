
import { Product } from "@/types/product";

export interface ProductLine {
  id?: string;
  product_id: string;
  product_title: string;
  quantity: number;
  notes: string;
}

export interface ProductSearchResult {
  id: string;
  title: string;
  isbn13: string | null;
}
