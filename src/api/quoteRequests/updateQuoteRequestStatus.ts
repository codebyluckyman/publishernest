
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequest } from "@/types/quoteRequest";

/**
 * Updates the status of a quote request
 */
export async function updateQuoteRequestStatus(
  id: string,
  status: 'pending' | 'approved' | 'declined'
): Promise<QuoteRequest | null> {
  try {
    const { data, error } = await supabase
      .from("quote_requests")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data as QuoteRequest;
  } catch (error: any) {
    console.error("Error updating quote request status:", error);
    throw error;
  }
}
