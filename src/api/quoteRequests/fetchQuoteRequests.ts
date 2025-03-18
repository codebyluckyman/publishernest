
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";
import { QuoteRequest } from "@/types/quoteRequest";

interface FetchQuoteRequestsParams {
  currentOrganization: Organization | null;
  status?: string;
  searchQuery?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export async function fetchQuoteRequests({
  currentOrganization,
  status,
  searchQuery,
  sortBy = 'requested_at',
  sortDirection = 'desc'
}: FetchQuoteRequestsParams): Promise<QuoteRequest[]> {
  try {
    if (!currentOrganization) {
      console.error("No organization selected");
      return [];
    }

    // Build the base query
    let query = supabase
      .from("quote_requests")
      .select(`
        *,
        supplier:suppliers(supplier_name),
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
            product:products(id, title, format_extras, format_extra_comments)
          ),
          price_breaks:quote_request_format_price_breaks(
            id,
            quantity,
            num_products
          )
        )
      `)
      .eq("organization_id", currentOrganization.id);

    // Add status filter if provided
    if (status && status !== 'all') {
      query = query.eq("status", status);
    }

    // Add search filter if provided
    if (searchQuery) {
      const searchTerms = searchQuery.toLowerCase().split(' ');
      
      if (searchTerms.length === 1) {
        // If single term, search in title, description and notes
        query = query.or(`title.ilike.%${searchTerms[0]}%,description.ilike.%${searchTerms[0]}%,notes.ilike.%${searchTerms[0]}%`);
      } else {
        // If multiple terms, search in title only but match all terms
        searchTerms.forEach(term => {
          query = query.ilike('title', `%${term}%`);
        });
      }
    }

    // Add sorting
    query = query.order(sortBy, { ascending: sortDirection === 'asc' });

    // Execute the query
    const { data: requests, error } = await query;

    if (error) {
      console.error("Error fetching quote requests:", error);
      throw error;
    }

    // Process the fetched data
    const processedRequests = requests.map((request: any) => {
      // Get supplier names from supplier_ids array
      let supplierNames: string[] = [];
      if (request.supplier_ids && request.supplier_ids.length > 0) {
        // We'd need to fetch supplier names separately since we can't use a direct join with an array
        // For now, we'll just use the single supplier name if it exists
        if (request.supplier && request.supplier.supplier_name) {
          supplierNames = [request.supplier.supplier_name];
        }
      } else if (request.supplier && request.supplier.supplier_name) {
        supplierNames = [request.supplier.supplier_name];
      }

      // Format formats and their products
      if (request.formats) {
        request.formats = request.formats.map((format: any) => {
          // Process products for this format
          const formattedProducts = format.products ? format.products.map((product: any) => {
            // Get format extras from the product table instead of the quote_request_format_products table
            const formatExtras = product.product?.format_extras || null;
            const formatExtraComments = product.product?.format_extra_comments || null;
            
            return {
              id: product.id,
              quote_request_format_id: format.id,
              product_id: product.product_id,
              quantity: product.quantity,
              notes: product.notes || null,
              format_extras: formatExtras,
              format_extra_comments: formatExtraComments,
              product_name: product.product?.title
            };
          }) : [];

          // Process price breaks for this format
          const formattedPriceBreaks = format.price_breaks ? format.price_breaks.map((priceBreak: any) => {
            return {
              id: priceBreak.id,
              quote_request_format_id: format.id,
              quantity: priceBreak.quantity,
              num_products: priceBreak.num_products
            };
          }) : [];

          // Return formatted format with products
          return {
            id: format.id,
            format_id: format.format_id,
            quote_request_id: request.id,
            notes: format.notes || "",
            format_name: format.format?.format_name,
            format: format.format, // Include format object to match expected type
            products: formattedProducts,
            price_breaks: formattedPriceBreaks,
            num_products: format.num_products || 1
          };
        });
      }

      // Return the processed request object with type assertion
      return {
        ...request,
        supplier_name: request.supplier?.supplier_name,
        supplier_names: supplierNames
      } as unknown as QuoteRequest; // Use type assertion to match expected type
    });

    return processedRequests;
  } catch (error: any) {
    console.error("Error in fetchQuoteRequests:", error);
    throw error;
  }
}

export async function fetchQuoteRequestById(id: string): Promise<QuoteRequest | null> {
  try {
    const { data: request, error } = await supabase
      .from("quote_requests")
      .select(`
        *,
        supplier:suppliers(supplier_name),
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
            product:products(id, title, format_extras, format_extra_comments)
          ),
          price_breaks:quote_request_format_price_breaks(
            id,
            quantity,
            num_products
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching quote request:", error);
      throw error;
    }

    if (!request) {
      return null;
    }

    // Get supplier names from supplier_ids array
    let supplierNames: string[] = [];
    if (request.supplier_ids && request.supplier_ids.length > 0) {
      // For now, just use the single supplier name if it exists
      if (request.supplier && request.supplier.supplier_name) {
        supplierNames = [request.supplier.supplier_name];
      }
    } else if (request.supplier && request.supplier.supplier_name) {
      supplierNames = [request.supplier.supplier_name];
    }

    // Format formats and their products
    if (request.formats) {
      request.formats = request.formats.map((format: any) => {
        // Process products for this format
        const formattedProducts = format.products ? format.products.map((product: any) => {
          // Get format extras from the product table instead of the quote_request_format_products table
          const formatExtras = product.product?.format_extras || null;
          const formatExtraComments = product.product?.format_extra_comments || null;
          
          return {
            id: product.id,
            quote_request_format_id: format.id,
            product_id: product.product_id,
            quantity: product.quantity,
            notes: product.notes || null,
            format_extras: formatExtras,
            format_extra_comments: formatExtraComments,
            product_name: product.product?.title
          };
        }) : [];

        // Process price breaks for this format
        const formattedPriceBreaks = format.price_breaks ? format.price_breaks.map((priceBreak: any) => {
          return {
            id: priceBreak.id,
            quote_request_format_id: format.id,
            quantity: priceBreak.quantity,
            num_products: priceBreak.num_products
          };
        }) : [];

        // Return formatted format with products
        return {
          id: format.id,
          format_id: format.format_id,
          quote_request_id: request.id,
          notes: format.notes || "",
          format_name: format.format?.format_name,
          format: format.format, // Include format object to match expected type
          products: formattedProducts,
          price_breaks: formattedPriceBreaks,
          num_products: format.num_products || 1
        };
      });
    }

    // Return the processed request object with type assertion
    return {
      ...request,
      supplier_name: request.supplier?.supplier_name,
      supplier_names: supplierNames
    } as unknown as QuoteRequest; // Use type assertion to match expected type
  } catch (error: any) {
    console.error("Error in fetchQuoteRequestById:", error);
    throw error;
  }
}
