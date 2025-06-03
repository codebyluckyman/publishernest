
import { ProductFilters } from './product';

export interface ProductSavedView {
  id: string;
  name: string;
  description: string | null;
  filters: ProductFilters;
  search_query: string | null;
  is_default: boolean;
  user_id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export type CreateProductSavedViewParams = {
  name: string;
  description?: string;
  filters: ProductFilters;
  search_query?: string;
  is_default?: boolean;
  organization_id: string;
};

export type UpdateProductSavedViewParams = {
  id: string;
  name?: string;
  description?: string | null;
  filters?: ProductFilters;
  search_query?: string | null;
  is_default?: boolean;
};
