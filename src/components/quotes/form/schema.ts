
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
          quantity: z.number().min(1, "Quantity must be at least 1"),
          num_products: z.number().min(1, "Number of products must be at least 1"),
        })
      ).optional().default([]),
    })
  ).optional(),
  products: z.record(z.any()).optional(),
  quantities: z.record(z.any()).optional(),
});

export type QuoteRequestFormValues = z.infer<typeof quoteRequestFormSchema>;
