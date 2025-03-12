
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequest, QuoteRequestFormValues } from "@/types/quoteRequest";

/**
 * Updates an existing quote request
 */
export async function updateQuoteRequest(
  id: string,
  updates: Partial<QuoteRequestFormValues>
): Promise<QuoteRequest | null> {
  try {
    // Convert Date object to ISO string if present
    const formattedUpdates = {
      ...updates,
      expected_delivery_date: updates.expected_delivery_date 
        ? updates.expected_delivery_date.toISOString().split('T')[0] 
        : undefined
    };

    const { data, error } = await supabase
      .from("quote_requests")
      .update(formattedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data as QuoteRequest;
  } catch (error: any) {
    console.error("Error updating quote request:", error);
    throw error;
  }
}
