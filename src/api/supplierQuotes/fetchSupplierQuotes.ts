
import { Organization } from "@/types/organization";
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuote } from "@/types/supplierQuote";

interface FetchQuotesParams {
  currentOrganization: Organization | null;
  status?: string;
  supplierId?: string;
  quoteRequestId?: string;
  searchQuery?: string;
}

export async function fetchSupplierQuotes(params: FetchQuotesParams): Promise<SupplierQuote[]> {
  const { currentOrganization, status, supplierId, quoteRequestId, searchQuery } = params;

  if (!currentOrganization) {
    return [];
  }

  let query = supabase
    .from("supplier_quotes")
    .select(`
      *,
      quote_request:quote_requests(id, title, description, due_date),
      supplier:suppliers(id, supplier_name)
    `)
    .eq("organization_id", currentOrganization.id);

  // Apply status filter if provided
  if (status) {
    const statuses = status.split(',');
    if (statuses.length > 0) {
      query = query.in("status", statuses);
    }
  }

  // Apply supplier filter if provided
  if (supplierId) {
    query = query.eq("supplier_id", supplierId);
  }

  // Apply quote request filter if provided
  if (quoteRequestId) {
    query = query.eq("quote_request_id", quoteRequestId);
  }

  // Apply search filter if provided
  if (searchQuery && searchQuery.trim() !== '') {
    const searchTerm = searchQuery.trim().toLowerCase();
    query = query.or(`
      reference_id.ilike.%${searchTerm}%,
      supplier.supplier_name.ilike.%${searchTerm}%,
      quote_request.title.ilike.%${searchTerm}%
    `);
  }

  // Order by created_at in descending order
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching supplier quotes:", error);
    throw error;
  }

  // Fetch formats for each quote
  const quotesWithFormats = await Promise.all(
    (data || []).map(async (quote) => {
      const { data: formats, error: formatsError } = await supabase
        .from("supplier_quote_formats")
        .select(`
          *,
          format:formats(id, format_name)
        `)
        .eq("supplier_quote_id", quote.id);

      if (formatsError) {
        console.error("Error fetching formats for quote:", formatsError);
        // Don't throw, just return quote without formats
        return quote;
      }

      return {
        ...quote,
        formats: formats ? formats.map(f => ({
          id: f.id,
          format_id: f.format_id,
          format_name: f.format?.format_name || "Unknown Format"
        })) : []
      };
    })
  );

  return quotesWithFormats;
}
