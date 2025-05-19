
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
    // Fixed: Add proper type check before accessing quote_request.id
    filteredData = filteredData.filter(
      (q) => q.quote_request && typeof q.quote_request === 'object' && 'id' in q.quote_request && q.quote_request.id === quoteRequestId
    );
  }

  // Transform the data to match the SupplierQuote type
  const supplierQuotes: SupplierQuote[] = filteredData.map((quote: any) => {
    // Create a properly typed SupplierQuote object
    const supplierQuote: SupplierQuote = {
      id: quote.id,
      organization_id: quote.organization_id,
      quote_request_id: quote.quote_request?.id || '',
      supplier_id: quote.supplier_id,
      status: quote.status as SupplierQuoteStatus,
      total_cost: quote.total_cost || null,
      currency: quote.currency || 'USD',
      notes: quote.notes || null,
      submitted_at: quote.submitted_at || null,
      created_at: quote.created_at,
      updated_at: quote.updated_at,
      reference_id: quote.reference_id || null,
      reference: quote.reference || null,
      supplier_name: quote.supplier_name || null,
      title: quote.title || null,
      valid_from: quote.valid_from || null,
      valid_to: quote.valid_to || null,
      terms: quote.terms || null,
      remarks: quote.remarks || null,
      production_schedule: quote.production_schedule || null,
      approved_at: quote.approved_at || null,
      approved_by: quote.approved_by || null,
      rejected_at: quote.rejected_at || null,
      rejected_by: quote.rejected_by || null,
      rejection_reason: quote.rejection_reason || null,
      packaging_carton_quantity: quote.packaging_carton_quantity || null,
      packaging_carton_weight: quote.packaging_carton_weight || null,
      packaging_carton_length: quote.packaging_carton_length || null,
      packaging_carton_width: quote.packaging_carton_width || null,
      packaging_carton_height: quote.packaging_carton_height || null,
      packaging_carton_volume: quote.packaging_carton_volume || null,
      packaging_cartons_per_pallet: quote.packaging_cartons_per_pallet || null,
      packaging_copies_per_20ft_palletized: quote.packaging_copies_per_20ft_palletized || null,
      packaging_copies_per_40ft_palletized: quote.packaging_copies_per_40ft_palletized || null,
      packaging_copies_per_20ft_unpalletized: quote.packaging_copies_per_20ft_unpalletized || null,
      packaging_copies_per_40ft_unpalletized: quote.packaging_copies_per_40ft_unpalletized || null,
      quote_request: quote.quote_request || {},
      supplier: quote.supplier || { supplier_name: quote.supplier_name || '' },
      formats: (quote.formats || []).map((format: any) => ({
        id: format.id || '',
        supplier_quote_id: format.supplier_quote_id || '',
        format_id: format.format_id || '',
        quote_request_format_id: format.quote_request_format_id || '',
        format_name: format.format?.format_name || "Unknown Format",
      })),
    };

    return supplierQuote;
  });

  return supplierQuotes;
}
