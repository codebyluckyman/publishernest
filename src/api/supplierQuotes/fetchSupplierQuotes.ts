
import { Database } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuote, SupplierQuoteStatus } from "@/types/supplierQuote";
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
  return {
    id: item.id,
    organization_id: item.organization_id,
    supplier_id: item.supplier_id,
    quote_request_id: item.quote_request_id,
    reference_id: item.reference_id || null,
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
    formats: item.formats || [],
    extraCosts: item.extraCosts || [],
    // Handle related objects safely
    supplier: typeof item.supplier === 'object' ? {
      supplier_name: item.supplier?.supplier_name || item.supplier_name || ''
    } : { supplier_name: item.supplier_name || '' },
    quote_request: typeof item.quote_request === 'object' ? {
      title: item.quote_request?.title || item.title || ''
    } : { title: item.title || '' },
    supplier_name: item.supplier_name || (item.supplier && item.supplier.supplier_name) || '',
    title: item.title || (item.quote_request && item.quote_request.title) || '',
  } as SupplierQuote;
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
