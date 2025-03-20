
export type Product = {
  id: string;
  title: string;
  isbn13: string | null;
  isbn10: string | null;
  cover_image_url: string | null;
  format_extras?: Array<{
    id?: string;
    name: string;
    description?: string;
    unit_of_measure_id?: string;
  }>;
  format_extra_comments?: string | null;
};
