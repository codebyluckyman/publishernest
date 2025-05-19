
import { Organization } from "@/types/organization";
import { supabase } from "@/integrations/supabase/client";
import {
  SupplierQuote,
  SupplierQuoteStatus,
  SupplierQuoteFormat,
} from "@/types/supplierQuote";

interface FetchQuotesParams {
  currentOrganization: Organization | null;
  status?: string;
  supplierId?: string;
  quoteRequestId?: string;
  searchQuery?: string;
  productId?: string;
  formatId?: string;
  supplier?: string;
  selectedFormat?: string;
}

export async function fetchSupplierQuotes(
  params: FetchQuotesParams
): Promise<SupplierQuote[]> {
  const {
    currentOrganization,
    status,
    supplierId,
    quoteRequestId,
    searchQuery,
    productId,
    formatId,
    supplier,
    selectedFormat,
  } = params;

  if (!currentOrganization) {
    return [];
  }

  // Prepare filters for the RPC
  const search_title =
    searchQuery && searchQuery.trim() !== "" ? searchQuery.trim() : null;
  const filter_supplier_name =
    supplier && supplier.trim() !== "" ? supplier.trim() : null;
  // Use selectedFormat or formatId as your filter
  const filter_format_id =
    selectedFormat && selectedFormat.trim() !== ""
      ? selectedFormat.trim()
      : formatId && formatId.trim() !== ""
      ? formatId.trim()
      : null;

  // Call the RPC function with filters
  const { data, error } = await supabase.rpc("test_search_quotes", {
    search_title,
    filter_supplier_name,
    filter_format_id,
  });

  if (error) {
    console.error("Error fetching supplier quotes:", error);
    throw error;
  }

  // Optionally, filter organization_id, quoteRequestId, supplierId, status in JS (or add to your RPC)
  let filteredData = data || [];
  if (currentOrganization?.id) {
    filteredData = filteredData.filter(
      (q) => q.organization_id === currentOrganization.id
    );
  }
  if (status) {
    const statuses = status.split(",");
    filteredData = filteredData.filter((q) => statuses.includes(q.status));
  }
  if (supplierId) {
    filteredData = filteredData.filter((q) => q.supplier_id === supplierId);
  }
  if (quoteRequestId) {
    // Fix: Use quote_request property and check its id
    filteredData = filteredData.filter((q) => {
      // Parse the quote_request JSON if needed
      const quoteRequest = typeof q.quote_request === 'string' 
        ? JSON.parse(q.quote_request) 
        : q.quote_request;
      
      return quoteRequest && quoteRequest.id === quoteRequestId;
    });
  }

  // Transform the data to match the expected SupplierQuote type
  const formattedQuotes = filteredData.map((quote) => {
    // Format the formats array to ensure it has format_name
    const formattedFormats: SupplierQuoteFormat[] =
      quote.formats && Array.isArray(quote.formats)
        ? quote.formats.map((format: any) => ({
            id: format.id || "",
            supplier_quote_id: format.supplier_quote_id || "",
            format_id: format.format_id || "",
            quote_request_format_id: format.quote_request_format_id || "",
            format_name: format.format?.format_name || "Unknown Format",
          }))
        : [];

    // Return a properly typed SupplierQuote
    return {
      ...quote,
      // Ensure all required properties are present
      quote_request_id: quote.quote_request?.id || "",
      total_cost: quote.total_cost || 0,
      submitted_at: quote.submitted_at || null,
      formats: formattedFormats,
    } as SupplierQuote;
  });

  return formattedQuotes;
}
