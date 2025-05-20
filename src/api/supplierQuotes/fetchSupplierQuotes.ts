
import { Organization } from "@/types/organization";
import { supabase } from "@/integrations/supabase/client";
import {
  SupplierQuote,
  SupplierQuoteStatus,
  SupplierQuoteFormat,
  SupplierQuoteExtraCost,
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
    // Fix: Filter by quote_request_id directly if it exists
    filteredData = filteredData.filter((q) => {
      if (typeof q.quote_request === 'string' && q.quote_request) {
        try {
          const quoteRequestObj = JSON.parse(q.quote_request);
          return quoteRequestObj && quoteRequestObj.id === quoteRequestId;
        } catch (e) {
          return false;
        }
      } else if (q.quote_request && typeof q.quote_request === 'object') {
        return q.quote_request.id === quoteRequestId;
      } else if (q.quote_request_id) {
        return q.quote_request_id === quoteRequestId;
      }
      return false;
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

    // Fix: Safely extract the quote_request_id
    let safeQuoteRequestId = "";
    if (quote.quote_request && typeof quote.quote_request === 'object' && quote.quote_request.id) {
      safeQuoteRequestId = quote.quote_request.id;
    } else if (quote.quote_request_id) {
      safeQuoteRequestId = quote.quote_request_id;
    }

    // Return a properly typed SupplierQuote with type assertion to handle mismatches
    return {
      ...quote,
      id: quote.id || "",
      quote_request_id: safeQuoteRequestId,
      total_cost: quote.total_cost !== undefined ? quote.total_cost : 0,
      submitted_at: quote.submitted_at || null,
      formats: formattedFormats,
      extra_costs: [], // Default empty array for extra_costs
      savings: [],     // Default empty array for savings
    } as unknown as SupplierQuote; // Type assertion to handle the conversion
  });

  return formattedQuotes;
}
