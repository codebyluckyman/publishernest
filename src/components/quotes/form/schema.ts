
import { z } from "zod";

export const quoteRequestFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(), // Changed from required to optional
  supplier_id: z.string().optional(), // Keep for backward compatibility
  supplier_ids: z.array(z.string()).min(1, "At least one supplier is required"),
  description: z.string().optional(),
  due_date: z.date().optional(),
  notes: z.string().optional(),
  formats: z.array(
    z.object({
      format_id: z.string().min(1, "Format is required"), // Updated to require format_id
      quantity: z.number().min(1, "Quantity must be at least 1"),
      notes: z.string().optional(),
      products: z.array(
        z.object({
          product_id: z.string().min(1, "Product is required"),
          quantity: z.number().min(1, "Quantity must be at least 1"),
          notes: z.string().optional(),
        })
      ).optional().default([]),
      price_breaks: z.array(
        z.object({
          from_quantity: z.number().min(0, "From quantity must be at least 0"),
          to_quantity: z.number().min(1, "To quantity must be at least 1"),
          one_product_price: z.boolean().optional().default(false),
          two_products_price: z.boolean().optional().default(false),
          three_products_price: z.boolean().optional().default(false),
          four_products_price: z.boolean().optional().default(false),
        })
      ).optional().default([]),
    })
  ).optional(),
  products: z.record(z.any()).optional(),
  quantities: z.record(z.any()).optional(),
});

export type QuoteRequestFormValues = z.infer<typeof quoteRequestFormSchema>;
