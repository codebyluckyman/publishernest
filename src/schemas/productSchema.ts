
import { z } from "zod";
import { FormatExtra } from "@/types/product";

const formatExtraSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  unit_of_measure_id: z.string().optional()
});

export const productSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  subtitle: z.string().nullish(),
  isbn13: z.string().nullable(),
  isbn10: z.string().nullable(),
  product_form: z.string().nullable(),
  product_form_detail: z.string().nullable(),
  publisher_name: z.string().nullable(),
  publication_date: z.any().nullable(),
  list_price: z.number().nullable(),
  edition_number: z.number().nullable(),
  page_count: z.number().nullable(),
  language_code: z.string().nullable(),
  subject_code: z.string().nullable(),
  series_name: z.string().nullable(),
  product_availability_code: z.string().nullable(),
  height_measurement: z.number().nullable(),
  width_measurement: z.number().nullable(),
  thickness_measurement: z.number().nullable(),
  weight_measurement: z.number().nullable(),
  format_id: z.string().nullable(),
  internal_images: z.array(z.string()).default([]),
  carton_quantity: z.number().nullable(),
  carton_length_mm: z.number().nullable(),
  carton_width_mm: z.number().nullable(),
  carton_height_mm: z.number().nullable(),
  carton_weight_kg: z.number().nullable(),
  age_range: z.string().default(""),
  synopsis: z.string().default(""),
  license: z.string().default(""),
  format_extras: z.object({
    foil: z.boolean().default(false),
    spot_uv: z.boolean().default(false),
    glitter: z.boolean().default(false),
    embossing: z.boolean().default(false),
    die_cut: z.boolean().default(false),
    holographic: z.boolean().default(false)
  }).default({
    foil: false,
    spot_uv: false,
    glitter: false,
    embossing: false,
    die_cut: false,
    holographic: false
  }),
  format_extras_array: z.array(formatExtraSchema).default([]),
  format_extra_comments: z.string().nullable(),
  status: z.string().default("active"),
  currency_code: z.string().nullable().default("USD"),
  cover_image_url: z.string().nullable()
});

export const defaultProductValues = {
  title: "",
  subtitle: null,
  isbn13: null,
  isbn10: null,
  product_form: null,
  product_form_detail: null,
  publisher_name: null,
  publication_date: null,
  list_price: null,
  edition_number: null,
  page_count: null,
  language_code: null,
  subject_code: null,
  series_name: null,
  product_availability_code: null,
  height_measurement: null,
  width_measurement: null,
  thickness_measurement: null,
  weight_measurement: null,
  format_id: null,
  internal_images: [],
  carton_quantity: null,
  carton_length_mm: null,
  carton_width_mm: null,
  carton_height_mm: null,
  carton_weight_kg: null,
  age_range: "",
  synopsis: "",
  license: "",
  format_extras: {
    foil: false,
    spot_uv: false,
    glitter: false,
    embossing: false,
    die_cut: false,
    holographic: false
  },
  format_extras_array: [],
  format_extra_comments: null,
  status: "active",
  currency_code: "USD",
  cover_image_url: null
};

export type ProductFormValues = z.infer<typeof productSchema>;

export const productFormOptions = {
  productForms: [
    { value: "BA", label: "Book" },
    { value: "BB", label: "Hardcover" },
    { value: "BC", label: "Paperback" },
    { value: "JB", label: "Journal" },
    { value: "DG", label: "Electronic" },
    { value: "XA", label: "Custom" },
  ],
  currencyCodes: [
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "GBP", label: "British Pound (GBP)" },
    { value: "CAD", label: "Canadian Dollar (CAD)" },
    { value: "AUD", label: "Australian Dollar (AUD)" },
  ],
  languageCodes: [
    { value: "eng", label: "English" },
    { value: "spa", label: "Spanish" },
    { value: "fre", label: "French" },
    { value: "ger", label: "German" },
    { value: "ita", label: "Italian" },
    { value: "por", label: "Portuguese" },
    { value: "chi", label: "Chinese" },
    { value: "jpn", label: "Japanese" },
  ],
  availabilityCodes: [
    { value: "IP", label: "In Print" },
    { value: "OS", label: "Out of Stock" },
    { value: "OI", label: "Out of Print" },
    { value: "RP", label: "Reprint" },
    { value: "AD", label: "Available Direct" },
  ],
};
