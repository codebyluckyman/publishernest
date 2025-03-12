
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
    const { data, error } = await supabase
      .from("quote_requests")
      .update(updates)
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
