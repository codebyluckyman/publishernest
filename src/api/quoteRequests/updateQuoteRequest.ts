
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
      due_date: updates.due_date 
        ? updates.due_date.toISOString().split('T')[0] 
        : undefined,
      // If supplier_ids is updated, update supplier_id for backward compatibility
      supplier_id: updates.supplier_ids && updates.supplier_ids.length > 0 
        ? updates.supplier_ids[0] 
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
