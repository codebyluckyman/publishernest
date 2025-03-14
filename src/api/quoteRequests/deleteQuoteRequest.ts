
import { supabase } from "@/integrations/supabase/client";
import { recordQuoteRequestAudit } from "./quoteRequestAudit";

/**
 * Deletes a quote request
 */
export async function deleteQuoteRequest(id: string, userId: string): Promise<boolean> {
  try {
    // Get the current data before deleting
    const { data: quoteRequest, error: fetchError } = await supabase
      .from("quote_requests")
      .select()
      .eq("id", id)
      .single();
      
    if (fetchError) throw fetchError;

    // Delete the quote request
    const { error } = await supabase
      .from("quote_requests")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // Record the deletion in the audit trail
    await recordQuoteRequestAudit(
      id,
      userId,
      quoteRequest,
      {},
      'delete'
    );

    return true;
  } catch (error: any) {
    console.error("Error deleting quote request:", error);
    throw error;
  }
}
