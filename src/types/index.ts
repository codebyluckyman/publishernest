
import { Product } from '@/components/format/types/ProductTypes';
import { Format } from '@/components/format/types/FormatTypes';

export type { Product, Format };

// Add extended product type with presentation display properties
export interface ExtendedProduct extends Product {
  price?: number;
  currency?: string;
  subtitle?: string;
  publisher_name?: string;
  publication_date?: string | null;
  synopsis?: string;
  format_id?: string | undefined; // Make sure format_id is included
}
