
import { SupplierQuote, SupplierQuoteStatus } from "@/types/supplierQuote";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";

type FetchSupplierQuotesParams = {
  currentOrganization: { id: string };
  status?: string;
  supplierId?: string;
  printRunId?: string;
  limit?: number;
  page?: number;
}

interface SupplierQuoteResponse {
  data: SupplierQuote[];
  count: number;
}

// Safely transform fetch results to expected SupplierQuote type
const transformQuote = (item: any): SupplierQuote => {
  // Create a base object with required properties
  const transformedQuote: SupplierQuote = {
    id: item.id,
    organization_id: item.organization_id,
    supplier_id: item.supplier_id,
    quote_request_id: item.quote_request_id,
    reference_id: item.reference_id || null,
    reference: item.reference || null, // Ensure reference is included
    status: item.status as SupplierQuoteStatus,
    notes: item.notes || null,
    remarks: item.remarks || null,
    terms: item.terms || null,
    currency: item.currency || 'USD',
    total_cost: item.total_cost || null,
    created_at: item.created_at,
    updated_at: item.updated_at,
    submitted_at: item.submitted_at || null,
    valid_from: item.valid_from || null,
    valid_to: item.valid_to || null,
    approved_at: item.approved_at || null,
    approved_by: item.approved_by || null,
    rejected_at: item.rejected_at || null,
    rejected_by: item.rejected_by || null,
    rejection_reason: item.rejection_reason || null,
    // Handle supplier data
    supplier: typeof item.supplier === 'object' ? {
      supplier_name: item.supplier?.supplier_name || ''
    } : { supplier_name: item.supplier_name || '' },
    // Handle quote request data
    quote_request: typeof item.quote_request === 'object' ? {
      title: item.quote_request?.title || ''
    } : { title: item.title || '' },
    // Extra fields
    supplier_name: item.supplier_name || (item.supplier && item.supplier.supplier_name) || '',
    title: item.title || (item.quote_request && item.quote_request.title) || '',
    // Packaging info
    packaging_carton_quantity: item.packaging_carton_quantity || null,
    packaging_carton_weight: item.packaging_carton_weight || null,
    packaging_carton_length: item.packaging_carton_length || null,
    packaging_carton_width: item.packaging_carton_width || null,
    packaging_carton_height: item.packaging_carton_height || null,
    packaging_carton_volume: item.packaging_carton_volume || null,
    packaging_cartons_per_pallet: item.packaging_cartons_per_pallet || null,
    packaging_copies_per_20ft_palletized: item.packaging_copies_per_20ft_palletized || null,
    packaging_copies_per_40ft_palletized: item.packaging_copies_per_40ft_palletized || null,
    packaging_copies_per_20ft_unpalletized: item.packaging_copies_per_20ft_unpalletized || null,
    packaging_copies_per_40ft_unpalletized: item.packaging_copies_per_40ft_unpalletized || null,
    // Additional properties
    production_schedule: item.production_schedule || null,
    formats: item.formats || [],
    price_breaks: item.price_breaks || [],
    extra_costs: item.extra_costs || [],
    savings: item.savings || [],
    attachments: item.attachments || [],
  };

  return transformedQuote;
};

export async function fetchSupplierQuotes(params: FetchSupplierQuotesParams): Promise<SupplierQuoteResponse> {
  const { currentOrganization, status, supplierId, printRunId, limit = 10, page = 1 } = params;
  
  try {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build query with filters
    let query = supabase
      .from("supplier_quotes")
      .select(`
        *,
        supplier:supplier_id (supplier_name),
        quote_request:quote_request_id (title),
        formats:supplier_quote_formats (
          *,
          format:format_id (*)
        )
      `, { count: 'exact' })
      .eq("organization_id", currentOrganization.id)
      .order('created_at', { ascending: false });
    
    // Apply optional filters
    if (status) {
      query = query.eq("status", status);
    }
    
    if (supplierId) {
      query = query.eq("supplier_id", supplierId);
    }
    
    if (printRunId) {
      query = query.eq("quote_request_id", printRunId);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error("Error fetching supplier quotes:", error);
      return { data: [], count: 0 };
    }
    
    // Transform results to ensure they match the SupplierQuote type
    const transformedData = data ? data.map(transformQuote) : [];
    
    return { 
      data: transformedData, 
      count: count || transformedData.length 
    };
  } catch (error) {
    console.error("Error in fetchSupplierQuotes:", error);
    return { data: [], count: 0 };
  }
}

export async function fetchAllSupplierQuotes(currentOrganization: Organization): Promise<SupplierQuoteResponse> {
  try {
    const { data, error, count } = await supabase
      .from("supplier_quotes")
      .select(`
        *,
        supplier:supplier_id (supplier_name),
        quote_request:quote_request_id (title),
        formats:supplier_quote_formats (
          *,
          format:format_id (*)
        )
      `, { count: 'exact' })
      .eq("organization_id", currentOrganization.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching all supplier quotes:", error);
      return { data: [], count: 0 };
    }
    
    // Transform results to ensure they match the SupplierQuote type
    const transformedData = data ? data.map(transformQuote) : [];
    
    return { 
      data: transformedData, 
      count: count || transformedData.length 
    };
  } catch (error) {
    console.error("Error in fetchAllSupplierQuotes:", error);
    return { data: [], count: 0 };
  }
}
