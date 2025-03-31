
import { supabase } from "@/integrations/supabase/client";
import { PriceBreak } from "@/types/quoteRequest";

/**
 * Updates price breaks for a specific format
 */
export async function updateFormatPriceBreaks(
  formatId: string,
  priceBreaks?: PriceBreak[],
  numProducts: number = 1
): Promise<void> {
  if (!priceBreaks) return;

  try {
    // Convert priceBreaks to JSON format for our new function
    const priceBreaksJson = JSON.stringify(priceBreaks);
    
    // Call the new database function that handles updates safely
    const { error } = await supabase.rpc(
      'update_format_price_breaks',
      {
        formatid: formatId,
        pricebreaks: priceBreaksJson,
        numproducts: numProducts
      }
    );

    if (error) {
      console.error("Error updating price breaks:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in updateFormatPriceBreaks:", error);
    throw error;
  }
}
