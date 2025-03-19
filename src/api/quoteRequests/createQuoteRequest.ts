
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
        notes: format.notes || null,
        num_products: format.num_products || 1
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
            // For each price break, create an entry in the database
            for (const priceBreak of format.price_breaks) {
              const { error: priceBreakError } = await supabase
                .from('quote_request_format_price_breaks')
                .insert({
                  quote_request_format_id: formatId,
                  quantity: priceBreak.quantity,
                  num_products: format.num_products || 1
                });

              if (priceBreakError) {
                console.error("Error inserting price break:", priceBreakError);
                throw priceBreakError;
              }
            }
          }
        }
      });

      // Wait for all format processing to complete
      await Promise.all(processFormatPromises);
    }
    
    // If extra costs were provided, insert them
    if (formData.extra_costs && formData.extra_costs.length > 0 && quoteRequestData) {
      const extraCostEntries = formData.extra_costs.map(cost => ({
        quote_request_id: quoteRequestData.id,
        name: cost.name,
        description: cost.description || null,
        estimated_cost: cost.estimated_cost || null
      }));

      const { error: extraCostsError } = await supabase
        .from('quote_request_extra_costs')
        .insert(extraCostEntries);

      if (extraCostsError) {
        console.error("Error inserting extra costs:", extraCostsError);
        throw extraCostsError;
      }
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
