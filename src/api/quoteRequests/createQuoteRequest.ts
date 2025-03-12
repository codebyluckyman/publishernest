
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequest, QuoteRequestFormValues } from "@/types/quoteRequest";

/**
 * Creates a new quote request
 */
export async function createQuoteRequest(
  formData: QuoteRequestFormValues,
  organizationId: string,
  userId: string
): Promise<QuoteRequest | null> {
  try {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const newQuoteRequest = {
      organization_id: organizationId,
      supplier_id: formData.supplier_id,
      title: formData.title,
      description: formData.description || null,
      status: "pending",
      requested_by: userId,
      expected_delivery_date: formData.expected_delivery_date || null,
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

    return quoteRequestData as QuoteRequest;
  } catch (error: any) {
    console.error("Error creating quote request:", error);
    throw error;
  }
}
