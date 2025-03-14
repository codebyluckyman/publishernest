
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequestFormValues } from "@/types/quoteRequest";
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

    const newQuoteRequest = {
      organization_id: organizationId,
      supplier_ids: formData.supplier_ids,
      supplier_id: formData.supplier_ids[0], // Keep backward compatibility
      title: formData.title,
      description: formData.description || null,
      status: "pending",
      requested_by: userId,
      due_date: formData.due_date 
        ? formData.due_date.toISOString().split('T')[0] 
        : null,
      products: formData.products || null,
      quantities: formData.quantities || null,
      notes: formData.notes || null
    };

    // Insert the quote request
    const { data: quoteRequestData, error: quoteRequestError } = await supabase
      .from("quote_requests")
      .insert(newQuoteRequest)
      .select()
      .single();

    if (quoteRequestError) throw quoteRequestError;

    // If formats were provided, insert them
    if (formData.formats && formData.formats.length > 0 && quoteRequestData) {
      const formatEntries = formData.formats.map(format => ({
        quote_request_id: quoteRequestData.id,
        format_id: format.format_id,
        quantity: format.quantity,
        notes: format.notes || null
      }));

      const { error: formatsError } = await supabase
        .from("quote_request_formats")
        .insert(formatEntries);

      if (formatsError) {
        console.error("Error inserting formats:", formatsError);
        throw formatsError;
      }
    }

    // Record the creation in the audit trail
    await recordQuoteRequestAudit(
      quoteRequestData.id,
      userId,
      {},
      quoteRequestData,
      'create'
    );

    return quoteRequestData;
  } catch (error: any) {
    console.error("Error creating quote request:", error);
    throw error;
  }
}
