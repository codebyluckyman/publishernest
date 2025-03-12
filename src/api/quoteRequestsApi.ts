
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequest, QuoteRequestFormValues } from "@/types/quoteRequest";
import { Organization } from "@/types/organization";

/**
 * Fetches quote requests based on provided parameters
 */
export async function fetchQuoteRequests(
  params: {
    currentOrganization: Organization | null;
    status?: string;
    searchQuery?: string;
  }
): Promise<QuoteRequest[]> {
  const { currentOrganization, status, searchQuery } = params;

  if (!currentOrganization) {
    return [];
  }

  try {
    let query = supabase
      .from("quote_requests")
      .select(`
        *,
        suppliers:supplier_id (supplier_name),
        quote_request_formats(
          id,
          format_id,
          quantity,
          notes,
          formats:format_id(format_name)
        )
      `)
      .eq("organization_id", currentOrganization.id);

    if (status && status !== 'all') {
      query = query.eq("status", status);
    }

    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    query = query.order("requested_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    // Transform the data to make it compatible with our QuoteRequest type
    return (data || []).map(item => {
      // Map quote_request_formats to our expected formats structure
      const formats = (item.quote_request_formats || []).map((f: any) => ({
        id: f.id,
        quote_request_id: item.id,
        format_id: f.format_id,
        quantity: f.quantity,
        notes: f.notes,
        format_name: f.formats?.format_name
      }));

      return {
        ...item,
        supplier_name: item.suppliers?.supplier_name || 'Unknown',
        formats: formats
      } as QuoteRequest;
    });
  } catch (error: any) {
    console.error("Error fetching quote requests:", error);
    throw error;
  }
}

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

/**
 * Updates an existing quote request
 */
export async function updateQuoteRequest(
  id: string,
  updates: Partial<QuoteRequestFormValues>
): Promise<QuoteRequest | null> {
  try {
    const { data, error } = await supabase
      .from("quote_requests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data as QuoteRequest;
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
  status: 'pending' | 'approved' | 'declined'
): Promise<QuoteRequest | null> {
  try {
    const { data, error } = await supabase
      .from("quote_requests")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data as QuoteRequest;
  } catch (error: any) {
    console.error("Error updating quote request status:", error);
    throw error;
  }
}

/**
 * Deletes a quote request
 */
export async function deleteQuoteRequest(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("quote_requests")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return true;
  } catch (error: any) {
    console.error("Error deleting quote request:", error);
    throw error;
  }
}
