
import { supabase } from "@/integrations/supabase/client";
import { PriceBreak } from "@/types/quoteRequest";

/**
 * Updates price breaks for a specific format
 */
export async function updateFormatPriceBreaks(
  formatId: string,
  priceBreaks?: PriceBreak[]
): Promise<void> {
  if (!priceBreaks) return;

  // First, delete existing price breaks for this format
  const { error: deletePriceBreaksError } = await supabase
    .from("quote_request_format_price_breaks")
    .delete()
    .eq("quote_request_format_id", formatId);

  if (deletePriceBreaksError) {
    console.error("Error deleting existing price breaks:", deletePriceBreaksError);
    throw deletePriceBreaksError;
  }

  // Insert new price breaks if any are specified
  if (priceBreaks.length > 0) {
    const priceBreakEntries = priceBreaks.map(priceBreak => ({
      quote_request_format_id: formatId,
      quantity: priceBreak.quantity,
      one_product_price: priceBreak.one_product_price || false,
      two_products_price: priceBreak.two_products_price || false,
      three_products_price: priceBreak.three_products_price || false,
      four_products_price: priceBreak.four_products_price || false
    }));

    const { error: insertPriceBreakError } = await supabase
      .from("quote_request_format_price_breaks")
      .insert(priceBreakEntries);

    if (insertPriceBreakError) {
      console.error("Error inserting price breaks:", insertPriceBreakError);
      throw insertPriceBreakError;
    }
  }
}
