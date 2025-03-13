
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
    // Extract formats from updates to handle separately
    const { formats, ...quoteRequestUpdates } = updates;

    // Convert Date object to ISO string if present
    const formattedUpdates = {
      ...quoteRequestUpdates,
      due_date: updates.due_date 
        ? updates.due_date.toISOString().split('T')[0] 
        : undefined,
      // If supplier_ids is updated, update supplier_id for backward compatibility
      supplier_id: updates.supplier_ids && updates.supplier_ids.length > 0 
        ? updates.supplier_ids[0] 
        : undefined
    };

    // Update the quote request first
    const { data, error } = await supabase
      .from("quote_requests")
      .update(formattedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // If formats are provided, update them
    if (formats && formats.length > 0) {
      // First, delete existing formats
      const { error: deleteError } = await supabase
        .from("quote_request_formats")
        .delete()
        .eq("quote_request_id", id);

      if (deleteError) throw deleteError;

      // Then, insert new formats
      const formatEntries = formats.map(format => ({
        quote_request_id: id,
        format_id: format.format_id,
        quantity: format.quantity,
        notes: format.notes || null
      }));

      const { error: insertError } = await supabase
        .from("quote_request_formats")
        .insert(formatEntries);

      if (insertError) throw insertError;
    }

    // Fetch the updated quote request with its formats
    const { data: updatedRequest, error: fetchError } = await supabase
      .from("quote_requests")
      .select(`
        *,
        quote_request_formats(
          id,
          format_id,
          quantity,
          notes,
          formats:format_id(format_name)
        )
      `)
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    return updatedRequest as QuoteRequest;
  } catch (error: any) {
    console.error("Error updating quote request:", error);
    throw error;
  }
}
