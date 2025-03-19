
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";
import { QuoteRequest } from "@/types/quoteRequest";

export interface FetchQuoteRequestsParams {
  currentOrganization: Organization | null;
  status?: string;
  searchQuery?: string;
  limit?: number;
  sortBy?: { field: string; direction: 'asc' | 'desc' };
}

export async function fetchQuoteRequests(params: FetchQuoteRequestsParams): Promise<QuoteRequest[]> {
  const { currentOrganization, status, searchQuery, limit = 100, sortBy } = params;
  
  if (!currentOrganization) {
    return [];
  }

  try {
    // Start building the query
    let query = supabase
      .from("quote_requests")
      .select(`
        *,
        formats:quote_request_formats(
          id, 
          format_id, 
          notes,
          num_products,
          format:formats(format_name),
          products:quote_request_format_products(
            id, 
            product_id, 
            quantity, 
            notes,
            product:products(title)
          ),
          price_breaks:quote_request_format_price_breaks(
            id, 
            quantity,
            num_products
          )
        ),
        extra_costs:quote_request_extra_costs(
          id,
          name,
          description,
          estimated_cost
        )
      `)
      .eq("organization_id", currentOrganization.id);

    // Add status filter if provided
    if (status && status !== 'all') {
      query = query.eq("status", status);
    }

    // Add search query if provided
    if (searchQuery && searchQuery.trim()) {
      query = query.ilike("title", `%${searchQuery.trim()}%`);
    }

    // Add sorting if provided
    if (sortBy) {
      query = query.order(sortBy.field, { ascending: sortBy.direction === 'asc' });
    } else {
      // Default sorting by requested_at in descending order
      query = query.order("requested_at", { ascending: false });
    }

    // Add limit
    query = query.limit(limit);

    // Execute the query
    const { data: quoteRequests, error } = await query;

    if (error) {
      console.error("Error fetching quote requests:", error);
      throw error;
    }

    // Enrich the data - map formats and supplier names
    const enrichedRequests = await Promise.all((quoteRequests || []).map(async (request) => {
      // Format supplier names
      let supplierNames: string[] = [];
      
      if (request.supplier_ids && request.supplier_ids.length > 0) {
        const { data: suppliers, error: suppliersError } = await supabase
          .from('suppliers')
          .select('supplier_name')
          .in('id', request.supplier_ids);
          
        if (!suppliersError && suppliers) {
          supplierNames = suppliers.map(s => s.supplier_name);
        }
      }
      
      // Format the format data
      const formattedFormats = request.formats?.map((format: any) => ({
        ...format,
        format_name: format.format?.format_name,
        products: format.products?.map((product: any) => ({
          ...product,
          product_name: product.product?.title,
        })) || [],
      }));

      return {
        ...request,
        formats: formattedFormats || [],
        supplier_names: supplierNames,
      };
    }));

    return enrichedRequests;
  } catch (error) {
    console.error("Error in fetchQuoteRequests:", error);
    throw error;
  }
}
