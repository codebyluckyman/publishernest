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

    // If formats exist in the updates, we'll fetch their names to use in the title
    let formatNames: string[] = [];
    if (updates.formats && updates.formats.length > 0) {
      const formatIds = updates.formats.map(format => format.format_id);
      
      // Fetch format names
      const { data: formats, error: formatsError } = await supabase
        .from("formats")
        .select("id, format_name")
        .in("id", formatIds);
      
      if (formatsError) {
        console.error("Error fetching format names:", formatsError);
      } else if (formats) {
        // Create a map of format IDs to names
        const formatNameMap = formats.reduce((map, format) => {
          map[format.id] = format.format_name;
          return map;
        }, {} as Record<string, string>);
        
        // Map the format IDs in updates to their names
        formatNames = updates.formats
          .map(format => formatNameMap[format.format_id])
          .filter(Boolean); // Filter out any undefined values
      }
    }
    
    // Generate title based on formats if available
    let title = updates.title;
    if (formatNames.length > 0) {
      title = `QR for ${formatNames.join(', ')}`;
    }

    // Prepare the update object
    const quoteRequestUpdates: any = {
      title: title,
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
      currency: updates.currency || currentQuoteRequest.currency || "USD",
      updated_at: new Date().toISOString(),
      production_schedule_requested: updates.production_schedule_requested !== undefined 
        ? updates.production_schedule_requested 
        : (currentQuoteRequest as QuoteRequest).production_schedule_requested
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
    
    // Handle savings updates if provided
    if (updates.savings !== undefined) {
      // First delete all existing savings
      const { error: deleteError } = await supabase
        .from("quote_request_savings")
        .delete()
        .eq("quote_request_id", id);
      
      if (deleteError) {
        console.error("Error deleting savings:", deleteError);
        throw deleteError;
      }
      
      // Then insert the new savings if any
      if (updates.savings && updates.savings.length > 0) {
        const savingsEntries = updates.savings.map(saving => ({
          quote_request_id: id,
          name: saving.name,
          description: saving.description || null,
          unit_of_measure_id: saving.unit_of_measure_id || null
        }));

        const { error: insertError } = await supabase
          .from('quote_request_savings')
          .insert(savingsEntries);

        if (insertError) {
          console.error("Error inserting updated savings:", insertError);
          throw insertError;
        }
      }
    }

    // Process attachments if they exist
    if (updates.attachments && updates.attachments.length > 0) {
      for (const file of updates.attachments) {
        // Upload file to storage
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `quote-requests/${id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);
          
        if (uploadError) {
          console.error("Error uploading file:", uploadError);
          continue; // Continue with other files if one fails
        }
        
        // Add record to database
        const { error: dbError } = await supabase
          .from('quote_request_attachments')
          .insert({
            quote_request_id: id,
            file_name: file.name,
            file_key: filePath,
            file_size: file.size,
            file_type: file.type,
            uploaded_by: userId
          });
          
        if (dbError) {
          console.error("Error adding attachment record:", dbError);
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
