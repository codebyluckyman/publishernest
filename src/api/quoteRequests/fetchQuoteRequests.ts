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
          format:formats(id, format_name),
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
        required_step:organization_production_steps!quote_requests_required_step_id_fkey(id, step_name),
        attachments:quote_request_attachments(*)
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

    // For debugging - log the first quote request to see its structure
    if (quoteRequests && quoteRequests.length > 0) {
      console.log("Sample quote request data (first item):", quoteRequests[0]);
      if (quoteRequests[0].formats && quoteRequests[0].formats.length > 0) {
        console.log("Sample format data:", quoteRequests[0].formats[0]);
        console.log("Format name access:", quoteRequests[0].formats[0].format?.format_name);
      }
      if (quoteRequests[0].savings) {
        console.log("Sample savings data:", quoteRequests[0].savings);
      }
      // Debug the required_step field
      console.log("Sample required_step data:", quoteRequests[0].required_step);
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
      
      // Process formats to include format_name directly from format object
      const processedFormats = request.formats?.map((formatItem: any) => {
        return {
          ...formatItem,
          format_name: formatItem.format?.format_name || 'Unknown Format',
          products: formatItem.products?.map((product: any) => ({
            ...product,
            product_name: product.product?.title || 'Unknown Product'
          })) || []
        };
      }) || [];
      
      // Format the extra costs with correct unit_of_measure_name
      const formattedExtraCosts = request.extra_costs?.map((cost: any) => ({
        id: cost.id,
        quote_request_id: request.id,
        name: cost.name,
        description: cost.description || "",
        unit_of_measure_id: cost.unit_of_measure_id,
        unit_of_measure_name: cost.unit_of_measures ? 
          (cost.unit_of_measures.abbreviation 
            ? `${cost.unit_of_measures.name} (${cost.unit_of_measures.abbreviation})` 
            : cost.unit_of_measures.name) 
          : null
      }));
      
      // Format the savings with correct unit_of_measure_name
      const formattedSavings = request.savings?.map((saving: any) => {
        return {
          id: saving.id,
          quote_request_id: request.id,
          name: saving.name,
          description: saving.description || "",
          unit_of_measure_id: saving.unit_of_measure_id,
          unit_of_measure_name: saving.unit_of_measures ? 
            (saving.unit_of_measures.abbreviation 
              ? `${saving.unit_of_measures.name} (${saving.unit_of_measures.abbreviation})` 
              : saving.unit_of_measures.name) 
            : null
        };
      }) || [];
      
      // Format the attachments
      const formattedAttachments = request.attachments || [];
      
      // Extract the required step name more safely
      // UPDATED: required_step is now an object from Supabase, not an array
      console.log(`Quote Request ${request.reference_id} - required_step:`, request.required_step);
      
      // Extract step name from required_step object
      const required_step_name = request.required_step ? request.required_step.step_name : null;
      
      console.log(`Quote Request ${request.reference_id} - required_step_name extracted:`, required_step_name);

      // Ensure the status is one of the valid enum values
      const validStatus = ['pending', 'approved', 'declined'].includes(request.status) 
        ? request.status as 'pending' | 'approved' | 'declined'
        : 'pending'; // Default to 'pending' if invalid

      // Create a new object with all the properties we need
      const enrichedRequest = {
        ...request,
        status: validStatus,
        formats: processedFormats,
        // Initialize supplier_names properly as an array with the fetched values
        supplier_names: supplierNames,
        // Set supplier_name from the first item in supplierNames array if available
        supplier_name: supplierNames.length > 0 ? supplierNames[0] : null,
        extra_costs: formattedExtraCosts || [],
        savings: formattedSavings || [],
        required_step_name: required_step_name,
        attachments: formattedAttachments,
      };

      // Return as QuoteRequest type after explicit type assertion
      return enrichedRequest as unknown as QuoteRequest;
    }));

    return enrichedRequests;
  } catch (error) {
    console.error("Error in fetchQuoteRequests:", error);
    throw error;
  }
}
