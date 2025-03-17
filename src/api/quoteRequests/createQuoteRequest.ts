
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequestFormValues, QuoteRequest } from "@/types/quoteRequest";
import { recordQuoteRequestAudit } from "./quoteRequestAudit";

/**
 * Creates a new quote request for a supplier
 */
export async function createQuoteRequest(
  formData: QuoteRequestFormValues,
  organizationId: string,
  userId: string
) {
  try {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    if (formData.supplier_ids.length === 0) {
      throw new Error("No suppliers selected");
    }

    console.log("Creating quote request with title:", formData.title);

    const newQuoteRequest = {
      organization_id: organizationId,
      supplier_ids: formData.supplier_ids,
      supplier_id: formData.supplier_ids[0], // Keep backward compatibility
      title: formData.title,
      description: formData.description || null,
      status: "pending" as const,
      requested_by: userId,
      due_date: formData.due_date 
        ? formData.due_date.toISOString().split('T')[0] 
        : null,
      products: formData.products || null,
      quantities: formData.quantities || null,
      notes: formData.notes || null
    };

    console.log("Quote request data to insert:", newQuoteRequest);

    // Insert the quote request
    const { data: quoteRequestData, error: quoteRequestError } = await supabase
      .from("quote_requests")
      .insert(newQuoteRequest)
      .select()
      .single();

    if (quoteRequestError) {
      console.error("Error inserting quote request:", quoteRequestError);
      throw quoteRequestError;
    }

    // If formats were provided, insert them
    if (formData.formats && formData.formats.length > 0 && quoteRequestData) {
      const formatEntries = formData.formats.map(format => ({
        quote_request_id: quoteRequestData.id,
        format_id: format.format_id,
        quantity: format.quantity,
        notes: format.notes || null
      }));

      const { error: formatsError, data: insertedFormats } = await supabase
        .from("quote_request_formats")
        .insert(formatEntries)
        .select();

      if (formatsError) {
        console.error("Error inserting formats:", formatsError);
        throw formatsError;
      }

      // Process each format's products and price breaks
      const processFormatPromises = formData.formats.map(async (format, index) => {
        if (insertedFormats && insertedFormats[index]) {
          const formatId = insertedFormats[index].id;
          
          // Process products if they exist
          if (format.products && format.products.length > 0) {
            const productEntries = format.products.map(product => ({
              quote_request_format_id: formatId,
              product_id: product.product_id,
              quantity: product.quantity,
              notes: product.notes || null
            }));

            const { error: productsError } = await supabase
              .from('quote_request_format_products')
              .insert(productEntries);

            if (productsError) {
              console.error("Error inserting format products:", productsError);
              throw productsError;
            }
          }
          
          // Process price breaks if they exist
          if (format.price_breaks && format.price_breaks.length > 0) {
            const priceBreakEntries = format.price_breaks.map(priceBreak => ({
              quote_request_format_id: formatId,
              from_quantity: priceBreak.from_quantity,
              to_quantity: priceBreak.to_quantity,
              one_product_price: priceBreak.one_product_price || false,
              two_products_price: priceBreak.two_products_price || false,
              three_products_price: priceBreak.three_products_price || false,
              four_products_price: priceBreak.four_products_price || false
            }));

            const { error: priceBreaksError } = await supabase
              .from('quote_request_format_price_breaks')
              .insert(priceBreakEntries);

            if (priceBreaksError) {
              console.error("Error inserting price breaks:", priceBreaksError);
              throw priceBreaksError;
            }
          }
        }
      });

      // Wait for all format processing to complete
      await Promise.all(processFormatPromises);
    }

    // Record the creation in the audit trail
    await recordQuoteRequestAudit(
      quoteRequestData.id,
      userId,
      {},
      quoteRequestData as Partial<QuoteRequest>,
      'create'
    );

    return quoteRequestData;
  } catch (error: any) {
    console.error("Error creating quote request:", error);
    throw error;
  }
}
