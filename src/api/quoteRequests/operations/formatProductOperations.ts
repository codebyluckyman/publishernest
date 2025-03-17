
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequestFormatProduct } from "@/types/quoteRequest";

/**
 * Updates products for a specific format
 */
export async function updateFormatProducts(
  formatId: string,
  products?: QuoteRequestFormatProduct[]
): Promise<void> {
  if (!products || products.length === 0) return;

  // First, delete existing products for this format
  const { error: deleteProductsError } = await supabase
    .from("quote_request_format_products")
    .delete()
    .eq("quote_request_format_id", formatId);

  if (deleteProductsError) {
    console.error("Error deleting existing products:", deleteProductsError);
    throw deleteProductsError;
  }

  // Insert new products
  const productEntries = products.map(product => ({
    quote_request_format_id: formatId,
    product_id: product.product_id,
    quantity: product.quantity,
    notes: product.notes || null
  }));

  const { error: insertProductsError } = await supabase
    .from("quote_request_format_products")
    .insert(productEntries);

  if (insertProductsError) {
    console.error("Error inserting products:", insertProductsError);
    throw insertProductsError;
  }
}
