
import { PresentationDisplaySettings } from './salesPresentation';

export interface ExtendedProduct {
  id: string;
  title: string;
  subtitle: string;
  synopsis: string;
  isbn13?: string;
  isbn10?: string;
  publisher_name: string;
  publication_date: string | null;
  price: number | null;
  currency?: string;
  format?: {
    id: string;
    format_name: string;
    binding_type?: string;
    dimensions?: string;
  } | null;
  format_extras: {
    id?: string;
    name: string;
    description?: string;
    unit_of_measure_id?: string;
  }[];
  [key: string]: any;
}
