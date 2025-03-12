
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequest } from "@/types/quoteRequest";
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
