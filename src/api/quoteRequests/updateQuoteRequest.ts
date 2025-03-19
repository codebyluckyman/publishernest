
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequestFormValues, QuoteRequest } from "@/types/quoteRequest";
import { recordQuoteRequestAudit } from "./quoteRequestAudit";
import { handleFormatOperations } from "./operations/formatOperations";

/**
 * Updates an existing quote request
 */
export async function updateQuoteRequest(
  id: string,
  updates: Partial<QuoteRequestFormValues>,
  userId: string
): Promise<QuoteRequest | null> {
  try {
    // Fetch current quote request to compare changes
    const { data: currentQuoteRequest, error: fetchError } = await supabase
      .from("quote_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching quote request for update:", fetchError);
      throw fetchError;
    }

    // Prepare the update object
    const quoteRequestUpdates: any = {
      title: updates.title,
      description: updates.description || null,
      supplier_ids: updates.supplier_ids || currentQuoteRequest.supplier_ids,
      supplier_id: updates.supplier_ids && updates.supplier_ids.length > 0 
        ? updates.supplier_ids[0] 
        : currentQuoteRequest.supplier_id,
      notes: updates.notes || null,
      due_date: updates.due_date 
        ? updates.due_date.toISOString().split('T')[0] 
        : null,
      products: updates.products || currentQuoteRequest.products,
      quantities: updates.quantities || currentQuoteRequest.quantities,
      updated_at: new Date().toISOString()
    };

    // Update the quote request
    const { data: updatedQuoteRequest, error: updateError } = await supabase
      .from("quote_requests")
      .update(quoteRequestUpdates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating quote request:", updateError);
      throw updateError;
    }

    // Handle format updates if provided
    if (updates.formats) {
      // First, fetch existing formats to compare
      const { data: existingFormats, error: existingFormatsError } = await supabase
        .from("quote_request_formats")
        .select("id, format_id, quantity, notes")
        .eq("quote_request_id", id);

      if (existingFormatsError) {
        console.error("Error fetching existing formats:", existingFormatsError);
        throw existingFormatsError;
      }

      // Handle all format operations in a dedicated function
      await handleFormatOperations(id, updates.formats, existingFormats || []);
    }
    
    // Handle extra costs updates if provided
    if (updates.extra_costs !== undefined) {
      // First delete all existing extra costs
      const { error: deleteError } = await supabase
        .from("quote_request_extra_costs")
        .delete()
        .eq("quote_request_id", id);
      
      if (deleteError) {
        console.error("Error deleting extra costs:", deleteError);
        throw deleteError;
      }
      
      // Then insert the new extra costs if any
      if (updates.extra_costs && updates.extra_costs.length > 0) {
        const extraCostEntries = updates.extra_costs.map(cost => ({
          quote_request_id: id,
          name: cost.name,
          description: cost.description || null,
          unit_of_measure_id: cost.unit_of_measure_id || null
        }));

        const { error: insertError } = await supabase
          .from('quote_request_extra_costs')
          .insert(extraCostEntries);

        if (insertError) {
          console.error("Error inserting updated extra costs:", insertError);
          throw insertError;
        }
      }
    }

    // Record the update in the audit trail
    await recordQuoteRequestAudit(
      id,
      userId,
      currentQuoteRequest as unknown as Partial<QuoteRequest>,
      updatedQuoteRequest as Partial<QuoteRequest>,
      'update'
    );

    return updatedQuoteRequest as QuoteRequest;
  } catch (error: any) {
    console.error("Error updating quote request:", error);
    throw error;
  }
}
