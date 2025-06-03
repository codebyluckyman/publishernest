
import { Organization } from "@/types/organization";
import { supabase } from "@/integrations/supabase/client";
import {
  SupplierQuote,
  SupplierQuoteStatus,
  SupplierQuoteFormat,
  SupplierQuotePriceBreak,
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
  const { data, error } = await supabase.rpc("search_quotes", {
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
    // Check if quote_request is an object and has an id property
    filteredData = filteredData.filter((q) => {
      if (typeof q.quote_request === 'object' && q.quote_request !== null) {
        return (q.quote_request as any).id === quoteRequestId;
      }
      return false;
    });
  }

  // Map the data from the view to match the SupplierQuote type
  const formattedQuotes: SupplierQuote[] = filteredData.map((item: any) => {
    // Safely handle quote_request which might be JSON or object
    let quoteRequestId = null;
    let priceBreaks: SupplierQuotePriceBreak[] = [];
    
    if (typeof item.quote_request === 'object' && item.quote_request !== null) {
      quoteRequestId = (item.quote_request as any).id;
      
      // Extract price breaks from the quote_request.formats structure
      const quoteRequestFormats = (item.quote_request as any).formats || [];
      quoteRequestFormats.forEach((format: any) => {
        if (format.price_breaks && Array.isArray(format.price_breaks)) {
          format.price_breaks.forEach((priceBreak: any) => {
            priceBreaks.push({
              id: priceBreak.id,
              supplier_quote_id: priceBreak.supplier_quote_id,
              quote_request_format_id: priceBreak.quote_request_format_id,
              price_break_id: priceBreak.price_break_id,
              product_id: priceBreak.product_id,
              format_id: priceBreak.format_id,
              quantity: priceBreak.quantity,
              unit_cost: priceBreak.unit_cost,
              unit_cost_1: priceBreak.unit_cost_1,
              unit_cost_2: priceBreak.unit_cost_2,
              unit_cost_3: priceBreak.unit_cost_3,
              unit_cost_4: priceBreak.unit_cost_4,
              unit_cost_5: priceBreak.unit_cost_5,
              unit_cost_6: priceBreak.unit_cost_6,
              unit_cost_7: priceBreak.unit_cost_7,
              unit_cost_8: priceBreak.unit_cost_8,
              unit_cost_9: priceBreak.unit_cost_9,
              unit_cost_10: priceBreak.unit_cost_10,
              num_products: priceBreak.num_products || 1,
            });
          });
        }
      });
    } else if (typeof item.quote_request === 'string') {
      try {
        const parsed = JSON.parse(item.quote_request);
        quoteRequestId = parsed.id;
      } catch {
        // If parsing fails, keep as null
      }
    }

    return {
      id: item.id,
      organization_id: item.organization_id,
      quote_request_id: quoteRequestId,
      supplier_id: item.supplier_id,
      status: item.status as SupplierQuoteStatus,
      total_cost: item.total_cost,
      currency: item.currency,
      notes: item.notes,
      submitted_at: item.submitted_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
      reference_id: item.reference_id,
      reference: item.reference,
      supplier_name: item.supplier_name,
      title: item.title,
      valid_from: item.valid_from,
      valid_to: item.valid_to,
      terms: item.terms,
      remarks: item.remarks,
      production_schedule: item.production_schedule,
      approved_at: item.approved_at,
      approved_by: item.approved_by,
      rejected_at: item.rejected_at,
      rejected_by: item.rejected_by,
      rejection_reason: item.rejection_reason,
      packaging_carton_quantity: item.packaging_carton_quantity,
      packaging_carton_weight: item.packaging_carton_weight,
      packaging_carton_length: item.packaging_carton_length,
      packaging_carton_width: item.packaging_carton_width,
      packaging_carton_height: item.packaging_carton_height,
      packaging_carton_volume: item.packaging_carton_volume,
      packaging_cartons_per_pallet: item.packaging_cartons_per_pallet,
      packaging_copies_per_20ft_palletized: item.packaging_copies_per_20ft_palletized,
      packaging_copies_per_40ft_palletized: item.packaging_copies_per_40ft_palletized,
      packaging_copies_per_20ft_unpalletized: item.packaging_copies_per_20ft_unpalletized,
      packaging_copies_per_40ft_unpalletized: item.packaging_copies_per_40ft_unpalletized,
      // Include quote_request and supplier with proper typing
      quote_request: item.quote_request,
      supplier: item.supplier || { supplier_name: item.supplier_name },
      // Handle formats and other arrays if needed
      formats: item.formats ? formatSupplierQuoteFormats(item.formats) : [],
      // Include the extracted price breaks
      price_breaks: priceBreaks,
      // Initialize other required arrays
      attachments: [],
      extra_costs: [],
      savings: []
    };
  });

  return formattedQuotes;
}

// Helper function to format supplier quote formats
function formatSupplierQuoteFormats(formats: any[]): SupplierQuoteFormat[] {
  if (!Array.isArray(formats)) return [];
  
  return formats.map(format => ({
    id: format.id,
    supplier_quote_id: format.supplier_quote_id,
    format_id: format.format_id,
    quote_request_format_id: format.quote_request_format_id,
    format_name: format.format?.format_name || "Unknown Format",
  }));
}
