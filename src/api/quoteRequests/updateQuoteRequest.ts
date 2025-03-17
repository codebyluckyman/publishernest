
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequestFormValues, QuoteRequest } from "@/types/quoteRequest";
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

      // Delete formats no longer in the update
      const updatedFormatIds = new Set(
        updates.formats
          .filter(format => format.format_id)
          .map(format => format.format_id)
      );

      for (const existingFormat of existingFormats || []) {
        if (!updatedFormatIds.has(existingFormat.format_id)) {
          const { error: deleteFormatError } = await supabase
            .from("quote_request_formats")
            .delete()
            .eq("id", existingFormat.id);

          if (deleteFormatError) {
            console.error("Error deleting format:", deleteFormatError);
            throw deleteFormatError;
          }
        }
      }

      // Upsert each format
      for (const format of updates.formats) {
        // Check if this format already exists
        const existingFormat = existingFormats?.find(
          ef => ef.format_id === format.format_id
        );

        if (existingFormat) {
          // Update existing format
          const { error: updateFormatError } = await supabase
            .from("quote_request_formats")
            .update({
              quantity: format.quantity,
              notes: format.notes || null
            })
            .eq("id", existingFormat.id);

          if (updateFormatError) {
            console.error("Error updating format:", updateFormatError);
            throw updateFormatError;
          }

          // Handle products for this format
          if (format.products && format.products.length > 0) {
            // First, delete existing products for this format
            const { error: deleteProductsError } = await supabase
              .from("quote_request_format_products")
              .delete()
              .eq("quote_request_format_id", existingFormat.id);

            if (deleteProductsError) {
              console.error("Error deleting existing products:", deleteProductsError);
              throw deleteProductsError;
            }

            // Insert new products
            const productEntries = format.products.map(product => ({
              quote_request_format_id: existingFormat.id,
              product_id: product.product_id,
              quantity: product.quantity,
              notes: product.notes || null
            }));

            const { error: insertProductsError } = await supabase
              .from("quote_request_format_products")
              .insert(productEntries);

            if (insertProductsError) {
              console.error("Error inserting products:", insertProductsError);
              throw insertProductsError;
            }
          }

          // Handle price breaks for this format
          if (format.price_breaks) {
            // First, delete existing price breaks for this format
            const { error: deletePriceBreaksError } = await supabase
              .from("quote_request_format_price_breaks")
              .delete()
              .eq("quote_request_format_id", existingFormat.id);

            if (deletePriceBreaksError) {
              console.error("Error deleting existing price breaks:", deletePriceBreaksError);
              throw deletePriceBreaksError;
            }

            // Insert new price breaks if any are specified
            if (format.price_breaks.length > 0) {
              for (const priceBreak of format.price_breaks) {
                const { error: insertPriceBreakError } = await supabase
                  .from("quote_request_format_price_breaks")
                  .insert({
                    quote_request_format_id: existingFormat.id,
                    from_quantity: priceBreak.from_quantity,
                    to_quantity: priceBreak.to_quantity,
                    one_product_price: priceBreak.one_product_price || false,
                    two_products_price: priceBreak.two_products_price || false,
                    three_products_price: priceBreak.three_products_price || false,
                    four_products_price: priceBreak.four_products_price || false
                  });

                if (insertPriceBreakError) {
                  console.error("Error inserting price break:", insertPriceBreakError);
                  throw insertPriceBreakError;
                }
              }
            }
          }
        } else {
          // Insert new format
          const { data: newFormat, error: insertFormatError } = await supabase
            .from("quote_request_formats")
            .insert({
              quote_request_id: id,
              format_id: format.format_id,
              quantity: format.quantity,
              notes: format.notes || null
            })
            .select()
            .single();

          if (insertFormatError) {
            console.error("Error inserting new format:", insertFormatError);
            throw insertFormatError;
          }

          // Handle products for this new format
          if (format.products && format.products.length > 0 && newFormat) {
            const productEntries = format.products.map(product => ({
              quote_request_format_id: newFormat.id,
              product_id: product.product_id,
              quantity: product.quantity,
              notes: product.notes || null
            }));

            const { error: insertProductsError } = await supabase
              .from("quote_request_format_products")
              .insert(productEntries);

            if (insertProductsError) {
              console.error("Error inserting products for new format:", insertProductsError);
              throw insertProductsError;
            }
          }

          // Handle price breaks for this new format
          if (format.price_breaks && format.price_breaks.length > 0 && newFormat) {
            for (const priceBreak of format.price_breaks) {
              const { error: insertPriceBreakError } = await supabase
                .from("quote_request_format_price_breaks")
                .insert({
                  quote_request_format_id: newFormat.id,
                  from_quantity: priceBreak.from_quantity,
                  to_quantity: priceBreak.to_quantity,
                  one_product_price: priceBreak.one_product_price || false,
                  two_products_price: priceBreak.two_products_price || false,
                  three_products_price: priceBreak.three_products_price || false,
                  four_products_price: priceBreak.four_products_price || false
                });

              if (insertPriceBreakError) {
                console.error("Error inserting price break for new format:", insertPriceBreakError);
                throw insertPriceBreakError;
              }
            }
          }
        }
      }
    }

    // Record the update in the audit trail
    await recordQuoteRequestAudit(
      id,
      userId,
      currentQuoteRequest,
      updatedQuoteRequest,
      'update'
    );

    return updatedQuoteRequest as QuoteRequest;
  } catch (error: any) {
    console.error("Error updating quote request:", error);
    throw error;
  }
}

/**
 * Updates the status of a quote request
 */
export async function updateQuoteRequestStatus(
  id: string,
  status: 'pending' | 'approved' | 'declined',
  userId: string
): Promise<void> {
  try {
    // Fetch current quote request to compare changes
    const { data: currentQuoteRequest, error: fetchError } = await supabase
      .from("quote_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching quote request for status update:", fetchError);
      throw fetchError;
    }

    // Update the status
    const { data: updatedQuoteRequest, error: updateError } = await supabase
      .from("quote_requests")
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating quote request status:", updateError);
      throw updateError;
    }

    // Record the status change in the audit trail
    await recordQuoteRequestAudit(
      id,
      userId,
      { status: currentQuoteRequest.status },
      { status },
      'status_change'
    );
  } catch (error: any) {
    console.error("Error updating quote request status:", error);
    throw error;
  }
}
