
import { z } from "zod";

export const quoteItemSchema = z.object({
  product_id: z.string().nullable(),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unit_price: z.coerce.number().min(0, "Unit price must be positive"),
  subtotal: z.coerce.number().min(0, "Subtotal must be positive"),
});

export const quoteSchema = z.object({
  supplier_id: z.string().nullable().optional(),
  supplier_name: z.string().min(1, "Supplier name is required"),
  contact_email: z.string().email("Invalid email").nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  quote_number: z.string().nullable().optional(),
  quote_date: z.date(),
  valid_until: z.date().nullable().optional(),
  currency_code: z.string().min(1, "Currency is required"),
  status: z.enum(["pending", "accepted", "rejected"]),
  notes: z.string().nullable().optional(),
  total_amount: z.coerce.number().min(0, "Total amount must be positive").nullable().optional(),
  items: z.array(quoteItemSchema).min(1, "At least one item is required"),
});

export type QuoteFormValues = z.infer<typeof quoteSchema>;
