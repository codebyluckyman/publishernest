
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequest, QuoteRequestFormValues } from "@/types/quoteRequest";
import { recordQuoteRequestAudit } from "./quoteRequestAudit";

/**
 * Updates an existing quote request
 */
export async function updateQuoteRequest(
  id: string,
  updates: Partial<QuoteRequestFormValues>,
  userId: string
): Promise<QuoteRequest | null> {
  try {
    // First, get the current state of the quote request before updates
    const { data: currentRequest, error: fetchError } = await supabase
      .from("quote_requests")
      .select(`
        *,
        quote_request_formats(
          id,
          format_id,
          quantity,
          notes
        )
      `)
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Extract formats from updates to handle separately
    const { formats, ...quoteRequestUpdates } = updates;

    // Format the date to preserve the selected date without timezone conversion
    // by using the date directly in YYYY-MM-DD format
    const formattedUpdates = {
      ...quoteRequestUpdates,
      due_date: updates.due_date 
        ? formatDateToYYYYMMDD(updates.due_date)
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
      // First, get existing format IDs
      const { data: existingFormats, error: getFormatsError } = await supabase
        .from("quote_request_formats")
        .select("id, format_id")
        .eq("quote_request_id", id);

      if (getFormatsError) throw getFormatsError;

      // Delete existing formats
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

      const { data: insertedFormats, error: insertError } = await supabase
        .from("quote_request_formats")
        .insert(formatEntries)
        .select();

      if (insertError) throw insertError;

      // Handle format products
      if (insertedFormats) {
        const productPromises = formats.map(async (format, index) => {
          if (format.products && format.products.length > 0 && insertedFormats[index]) {
            const formatId = insertedFormats[index].id;
            
            // Delete any existing products for this format
            await supabase
              .from("quote_request_format_products")
              .delete()
              .eq("quote_request_format_id", formatId);
            
            const productEntries = format.products.map(product => ({
              quote_request_format_id: formatId,
              product_id: product.product_id,
              quantity: product.quantity,
              notes: product.notes || null
            }));

            const { error: productsError } = await supabase
              .from("quote_request_format_products")
              .insert(productEntries);

            if (productsError) {
              console.error("Error inserting format products:", productsError);
              throw productsError;
            }
          }
        });

        // Wait for all product insertions to complete
        await Promise.all(productPromises);
      }
    }

    // Fetch the updated quote request with its formats
    const { data: updatedRequest, error: fetchError2 } = await supabase
      .from("quote_requests")
      .select(`
        *,
        quote_request_formats(
          id,
          format_id,
          quantity,
          notes,
          formats:format_id(format_name),
          quote_request_format_products(
            id,
            product_id,
            quantity,
            notes,
            products:product_id(id, title)
          )
        )
      `)
      .eq("id", id)
      .single();

    if (fetchError2) throw fetchError2;

    // Record the audit entry
    await recordQuoteRequestAudit(
      id,
      userId,
      currentRequest as Partial<QuoteRequest>,
      updatedRequest as Partial<QuoteRequest>,
      'update'
    );

    return updatedRequest as QuoteRequest;
  } catch (error: any) {
    console.error("Error updating quote request:", error);
    throw error;
  }
}

/**
 * Helper function to format a Date to YYYY-MM-DD string
 * without timezone conversion issues
 */
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  // getMonth() is 0-indexed, so add 1
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
