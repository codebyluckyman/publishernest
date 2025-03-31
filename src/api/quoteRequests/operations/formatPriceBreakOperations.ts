
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
    // Convert priceBreaks to JSON format for our function
    const priceBreaksJson = JSON.stringify(priceBreaks);
    
    // Call the database function through raw SQL instead of RPC
    // since the RPC function may not be correctly registered
    const { error } = await supabase.from('quote_request_format_price_breaks')
      .upsert(
        priceBreaks.map(pb => ({
          id: pb.id, // Preserve the ID if it exists
          quote_request_format_id: formatId,
          quantity: pb.quantity,
          num_products: numProducts
        })),
        { onConflict: 'id' }
      );

    if (error) {
      console.error("Error updating price breaks:", error);
      throw error;
    }

    // Delete any price breaks that were removed and aren't referenced by supplier quotes
    const existingIds = priceBreaks.filter(pb => pb.id).map(pb => pb.id);
    
    if (existingIds.length > 0) {
      const { error: deleteError } = await supabase.rpc(
        'delete_unused_price_breaks',
        {
          format_id: formatId,
          preserved_ids: existingIds
        }
      );
      
      if (deleteError) {
        console.error("Error cleaning up unused price breaks:", deleteError);
        // Don't throw on cleanup errors to avoid breaking the main flow
      }
    }
  } catch (error) {
    console.error("Error in updateFormatPriceBreaks:", error);
    throw error;
  }
}
