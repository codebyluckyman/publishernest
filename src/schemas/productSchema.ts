
import { z } from "zod";

// Default values for the product form
export const defaultProductValues = {
  title: "",
  subtitle: "",
  isbn13: "",
  isbn10: "",
  publication_date: null,
  publisher_name: "",
  product_form: "",
  list_price: null,
  series_name: null,
  synopsis: "",
  age_range: "",
  language_code: "",
  license: "",
  subject_code: "",
  product_availability_code: "",
  product_form_detail: "",
  status: "active",
  format_id: null,
  page_count: null,
  edition_number: null,
  height_measurement: null,
  width_measurement: null,
  thickness_measurement: null,
  weight_measurement: null,
  cover_image_url: null,
  carton_quantity: null,
  carton_length_mm: null,
  carton_width_mm: null,
  carton_height_mm: null,
  carton_weight_kg: null,
  internal_images: [],
  format_extras: {
    foil: false,
    spot_uv: false,
    glitter: false,
    embossing: false,
    die_cut: false,
    holographic: false
  },
  format_extra_comments: null,
  // Added custom fields
  custom_fields: {}
};

// Define the schema for product form validation
export const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().nullable().optional(),
  isbn13: z.string().nullable().optional(),
  isbn10: z.string().nullable().optional(),
  publication_date: z.date().nullable().optional(),
  publisher_name: z.string().nullable().optional(),
  product_form: z.string().nullable().optional(),
  list_price: z.number().nullable().optional(),
  series_name: z.string().nullable().optional(),
  synopsis: z.string().nullable().optional(),
  age_range: z.string().nullable().optional(),
  language_code: z.string().nullable().optional(),
  license: z.string().nullable().optional(),
  subject_code: z.string().nullable().optional(),
  product_availability_code: z.string().nullable().optional(),
  product_form_detail: z.string().nullable().optional(),
  status: z.string(),
  format_id: z.string().nullable().optional(),
  page_count: z.number().nullable().optional(),
  edition_number: z.number().nullable().optional(),
  height_measurement: z.number().nullable().optional(),
  width_measurement: z.number().nullable().optional(),
  thickness_measurement: z.number().nullable().optional(),
  weight_measurement: z.number().nullable().optional(),
  cover_image_url: z.string().nullable().optional(),
  carton_quantity: z.number().nullable().optional(),
  carton_length_mm: z.number().nullable().optional(),
  carton_width_mm: z.number().nullable().optional(),
  carton_height_mm: z.number().nullable().optional(),
  carton_weight_kg: z.number().nullable().optional(),
  internal_images: z.array(z.string()).optional(),
  format_extras: z.object({
    foil: z.boolean().optional(),
    spot_uv: z.boolean().optional(),
    glitter: z.boolean().optional(),
    embossing: z.boolean().optional(),
    die_cut: z.boolean().optional(),
    holographic: z.boolean().optional()
  }).optional(),
  format_extra_comments: z.string().nullable().optional(),
  // Added custom fields - we use record for dynamic fields
  custom_fields: z.record(z.string(), z.any()).optional()
});

export type ProductFormValues = z.infer<typeof productSchema>;
