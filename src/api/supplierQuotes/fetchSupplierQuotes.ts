
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
    // Filter by quote_request_id or by quote_request.id if it's an object
    filteredData = filteredData.filter((q) => {
      // Check if quote_request is a string that might be a JSON object
      if (typeof q.quote_request === 'string' && q.quote_request) {
        try {
          const quoteRequestObj = JSON.parse(q.quote_request);
          return quoteRequestObj && quoteRequestObj.id === quoteRequestId;
        } catch (e) {
          // If it can't be parsed as JSON, it's not a match
          return false;
        }
      } 
      // Check if quote_request is an object with an id property
      else if (q.quote_request && typeof q.quote_request === 'object') {
        if (q.quote_request.id) {
          return q.quote_request.id === quoteRequestId;
        }
      } 
      // Check if there's a direct quote_request_id property
      else if (q.quote_request_id) {
        return q.quote_request_id === quoteRequestId;
      }
      return false;
    });
  }

  // Transform the data to match the expected SupplierQuote type
  const formattedQuotes: SupplierQuote[] = filteredData.map((quote: any) => {
    // Format the formats array to ensure it has format_name
    const formattedFormats: SupplierQuoteFormat[] = Array.isArray(quote.formats)
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
    } else if (typeof quote.quote_request === 'string' && quote.quote_request) {
      try {
        const quoteRequestObj = JSON.parse(quote.quote_request);
        if (quoteRequestObj && quoteRequestObj.id) {
          safeQuoteRequestId = quoteRequestObj.id;
        }
      } catch (e) {
        // Unable to parse, leave empty
      }
    }

    // Ensure extra_costs is always an array
    const safeExtraCosts = Array.isArray(quote.extra_costs) 
      ? quote.extra_costs 
      : [];

    // Ensure savings is always an array
    const safeSavings = Array.isArray(quote.savings) 
      ? quote.savings 
      : [];

    // Return a properly typed SupplierQuote with safe default values
    return {
      id: quote.id || "",
      organization_id: quote.organization_id || "",
      supplier_id: quote.supplier_id || "",
      quote_request_id: safeQuoteRequestId,
      currency: quote.currency || "",
      description: quote.description || "",
      status: (quote.status as SupplierQuoteStatus) || "draft",
      formats: formattedFormats,
      extra_costs: safeExtraCosts as SupplierQuoteExtraCost[],
      savings: safeSavings,
      total_cost: typeof quote.total_cost === 'number' ? quote.total_cost : 0,
      submitted_at: quote.submitted_at || null,
      notes: quote.notes || "",
      created_at: quote.created_at || new Date().toISOString(),
      updated_at: quote.updated_at || new Date().toISOString(),
      // Add all other required fields with safe defaults
      delivery_days: quote.delivery_days || 0,
      due_date: quote.due_date || null,
      packaging_carton_height: quote.packaging_carton_height || 0,
      packaging_carton_length: quote.packaging_carton_length || 0,
      packaging_carton_qty: quote.packaging_carton_qty || 0,
      packaging_carton_weight: quote.packaging_carton_weight || 0,
      packaging_carton_width: quote.packaging_carton_width || 0,
      packaging_inner_height: quote.packaging_inner_height || 0,
      packaging_inner_length: quote.packaging_inner_length || 0,
      packaging_inner_qty: quote.packaging_inner_qty || 0,
      packaging_inner_weight: quote.packaging_inner_weight || 0,
      packaging_inner_width: quote.packaging_inner_width || 0,
      packaging_outer_height: quote.packaging_outer_height || 0,
      packaging_outer_length: quote.packaging_outer_length || 0,
      packaging_outer_qty: quote.packaging_outer_qty || 0,
      packaging_outer_weight: quote.packaging_outer_weight || 0,
      packaging_outer_width: quote.packaging_outer_width || 0,
      payment_terms: quote.payment_terms || "",
      production_schedule: quote.production_schedule || null,
      quote_reference: quote.quote_reference || "",
      transportation_method: quote.transportation_method || "",
      unit_of_measure_id: quote.unit_of_measure_id || "",
      valid_from: quote.valid_from || null,
      valid_to: quote.valid_to || null,
      warehouse_id: quote.warehouse_id || null,
    };
  });

  return formattedQuotes;
}
