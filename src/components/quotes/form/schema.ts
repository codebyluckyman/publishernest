
import { z } from "zod";

// Define schemas for nested objects
const productSchema = z.object({
  product_id: z.string().min(1, { message: "Product ID is required" }),
  quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
  notes: z.string().optional(),
});

const priceBreakSchema = z.object({
  id: z.string().optional(), // Add the id field for price breaks
  quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
});

// Main schema for Quote Request Form
export const quoteRequestFormSchema = z.object({
  id: z.string().optional(), // Add the ID field for the quote request
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  supplier_ids: z.string().array().nonempty({ message: "At least one supplier must be selected" }),
  supplier_id: z.string().optional(), // Add supplier_id for backward compatibility
  description: z.string().optional(),
  due_date: z.date().optional(),
  notes: z.string().optional(),
  formats: z.array(
    z.object({
      format_id: z.string().min(1, { message: "Format is required" }),
      notes: z.string().optional(),
      products: z.array(productSchema).optional(),
      price_breaks: z.array(priceBreakSchema).optional(),
      num_products: z.number().optional(),
    })
  ).optional(),
  products: z.record(z.any()).optional(),
  quantities: z.record(z.any()).optional(),
  currency: z.string().optional(),
  reference_id: z.string().optional(),
  production_schedule_requested: z.boolean().default(false),
  required_step_id: z.string().nullable().optional(),
  required_step_date: z.date().nullable().optional(),
  attachments: z.any().optional()
});

export interface QuoteRequestFormValues {
  id?: string; // Add the ID field
  title: string;
  supplier_ids: string[];
  supplier_id?: string; // Add supplier_id for backward compatibility
  description?: string;
  due_date?: Date;
  notes?: string;
  formats?: {
    format_id: string;
    notes?: string;
    products?: {
      product_id: string;
      quantity: number;
      notes?: string;
    }[];
    price_breaks?: {
      id?: string; // Add the ID field to preserve it when editing
      quantity: number;
    }[];
    num_products?: number;
  }[];
  products?: Record<string, any>;
  quantities?: Record<string, any>;
  currency?: string;
  reference_id?: string;
  production_schedule_requested?: boolean;
  required_step_id?: string | null;
  required_step_date?: Date | null;
  attachments?: File[];
}
