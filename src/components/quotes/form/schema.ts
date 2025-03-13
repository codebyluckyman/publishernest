
import { z } from "zod";

export const quoteRequestFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  supplier_id: z.string().optional(), // Keep for backward compatibility
  supplier_ids: z.array(z.string()).min(1, "At least one supplier is required"),
  description: z.string().optional(),
  expected_delivery_date: z.date().optional(),
  notes: z.string().optional(),
  formats: z.array(
    z.object({
      format_id: z.string().min(1, "Format is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      notes: z.string().optional(),
    })
  ).optional(),
  products: z.record(z.any()).optional(),
  quantities: z.record(z.any()).optional(),
});

export type QuoteRequestFormValues = z.infer<typeof quoteRequestFormSchema>;
