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
          unit_of_measure_id,
          unit_of_measures(id, name, abbreviation)
        ),
        savings:quote_request_savings(
          id,
          name,
          description,
          unit_of_measure_id,
          unit_of_measures(id, name, abbreviation)
        ),
        required_step:organization_production_steps(id, step_name)
      `)
      .eq("organization_id", currentOrganization.id);

    // Add status filter if provided
    if (status && status !== 'all') {
      query = query.eq("status", status);
    }

    // Add search query if provided
    if (searchQuery && searchQuery.trim()) {
      // Updated to include reference_id in search
      query = query.or(`title.ilike.%${searchQuery.trim()}%,reference_id.ilike.%${searchQuery.trim()}%`);
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

      // Format the extra costs with correct unit_of_measure_name
      const formattedExtraCosts = request.extra_costs?.map((cost: any) => ({
        id: cost.id,
        quote_request_id: request.id,
        name: cost.name,
        description: cost.description,
        unit_of_measure_id: cost.unit_of_measure_id,
        unit_of_measure_name: cost.unit_of_measures ? 
          (cost.unit_of_measures.abbreviation 
            ? `${cost.unit_of_measures.name} (${cost.unit_of_measures.abbreviation})` 
            : cost.unit_of_measures.name) 
          : null
      }));
      
      // Format the savings with correct unit_of_measure_name
      const formattedSavings = request.savings?.map((saving: any) => ({
        id: saving.id,
        quote_request_id: request.id,
        name: saving.name,
        description: saving.description,
        unit_of_measure_id: saving.unit_of_measure_id,
        unit_of_measure_name: saving.unit_of_measures ? 
          (saving.unit_of_measures.abbreviation 
            ? `${saving.unit_of_measures.name} (${saving.unit_of_measures.abbreviation})` 
            : saving.unit_of_measures.name) 
          : null
      }));

      // Get the required step name
      const required_step_name = request.required_step && Array.isArray(request.required_step) && request.required_step.length > 0 
        ? request.required_step[0]?.step_name 
        : null;

      // Ensure the status is one of the valid enum values
      const validStatus = ['pending', 'approved', 'declined'].includes(request.status) 
        ? request.status as 'pending' | 'approved' | 'declined'
        : 'pending'; // Default to 'pending' if invalid

      return {
        ...request,
        status: validStatus,
        formats: formattedFormats || [],
        supplier_names: supplierNames,
        // Set supplier_name from the first item in supplierNames array if available
        supplier_name: supplierNames.length > 0 ? supplierNames[0] : null,
        extra_costs: formattedExtraCosts || [],
        savings: formattedSavings || [],
        required_step_name: required_step_name,
      } as QuoteRequest;
    }));

    return enrichedRequests;
  } catch (error) {
    console.error("Error in fetchQuoteRequests:", error);
    throw error;
  }
}
