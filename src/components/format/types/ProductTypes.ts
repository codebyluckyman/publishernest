
export type Product = {
  id: string;
  title: string;
  isbn13: string | null;
  isbn10: string | null;
  cover_image_url: string | null;
  format_extras?: {
    foil: boolean;
    spot_uv: boolean;
    glitter: boolean;
    embossing: boolean;
    die_cut: boolean;
    holographic: boolean;
  };
};
