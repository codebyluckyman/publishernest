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

    // If formats exist, we'll fetch the format names to use in the title
    let formatNames: string[] = [];
    if (formData.formats && formData.formats.length > 0) {
      const formatIds = formData.formats.map(format => format.format_id);
      
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
        
        // Map the format IDs in formData to their names
        formatNames = formData.formats
          .map(format => formatNameMap[format.format_id])
          .filter(Boolean); // Filter out any undefined values
      }
    }
    
    // Generate title based on formats if available
    let title = formData.title;
    if (formatNames.length > 0) {
      title = `QR for ${formatNames.join(', ')}`;
    } else if (!title) {
      title = `Quote Request - ${new Date().toLocaleDateString()}`;
    }

    console.log("Creating quote request with title:", title);

    // Format the required step date if it exists
    const requiredStepDate = formData.required_step_date 
      ? formData.required_step_date.toISOString().split('T')[0] 
      : null;

    const newQuoteRequest = {
      organization_id: organizationId,
      supplier_ids: formData.supplier_ids,
      supplier_id: formData.supplier_ids[0], // Keep backward compatibility
      title: title,
      description: formData.description || null,
      status: "pending" as const,
      requested_by: userId,
      due_date: formData.due_date 
        ? formData.due_date.toISOString().split('T')[0] 
        : null,
      products: formData.products || null,
      quantities: formData.quantities || null,
      notes: formData.notes || null,
      currency: formData.currency || "USD",
      production_schedule_requested: formData.production_schedule_requested || false,
      required_step_id: formData.required_step_id || null,
      required_step_date: requiredStepDate
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
        unit_of_measure_id: cost.unit_of_measure_id || null
      }));

      const { error: extraCostsError } = await supabase
        .from('quote_request_extra_costs')
        .insert(extraCostEntries);

      if (extraCostsError) {
        console.error("Error inserting extra costs:", extraCostsError);
        throw extraCostsError;
      }
    }
    
    // If savings were provided, insert them
    if (formData.savings && formData.savings.length > 0 && quoteRequestData) {
      const savingsEntries = formData.savings.map(saving => ({
        quote_request_id: quoteRequestData.id,
        name: saving.name,
        description: saving.description || null,
        unit_of_measure_id: saving.unit_of_measure_id || null
      }));

      const { error: savingsError } = await supabase
        .from('quote_request_savings')
        .insert(savingsEntries);

      if (savingsError) {
        console.error("Error inserting savings:", savingsError);
        throw savingsError;
      }
    }

    // Process attachments if they exist
    if (formData.attachments && formData.attachments.length > 0 && quoteRequestData) {
      for (const file of formData.attachments) {
        // Upload file to storage
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `quote-requests/${quoteRequestData.id}/${fileName}`;
        
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
            quote_request_id: quoteRequestData.id,
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
