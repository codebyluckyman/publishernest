import { supabase } from "@/integrations/supabase/client";
import { QuoteRequest } from "@/types/quoteRequest";

// Helper function to apply search filter
const applySearchFilter = (query: any, search: string) => {
  if (search) {
    query = query.ilike("title", `%${search}%`);
  }
  return query;
};

// Helper function to apply status filter
const applyStatusFilter = (query: any, status: string) => {
  if (status) {
    query = query.eq("status", status);
  }
  return query;
};

/**
 * Fetches a list of quote requests with additional data like suppliers and formats
 */
export async function fetchQuoteRequests(organizationId: string, status?: string, search?: string) {
  try {
    // Initialize the query
    let initialQuery = supabase
      .from("quote_requests")
      .select(`
        *,
        supplier:suppliers(supplier_name),
        formats:quote_request_formats(
          id, 
          format_id, 
          quantity, 
          notes,
          format:formats(format_name),
          products:quote_request_format_products(
            id, 
            product_id, 
            quantity, 
            notes,
            product:products(id, title, format_extras, format_extra_comments)
          )
        )
      `)
      .eq("organization_id", organizationId);

    // Apply filters
    let query = applySearchFilter(initialQuery, search);
    query = applyStatusFilter(query, status);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching quote requests:", error);
      throw error;
    }

    // Transform the data to include properly named format and product information
    const transformedData = data.map(request => {
      // Map supplier name from the joined supplier object
      const supplierName = request.supplier ? request.supplier.supplier_name : null;

      // Map formats with properly named format information
      if (request.formats) {
        request.formats = request.formats.map((format: any) => {
          // Extract format name from the joined format object
          const formatName = format.format?.format_name;
          
          // Map products with properly named product information
          if (format.products) {
            format.products = format.products.map((productEntry: any) => {
              const product = productEntry.product;
              return {
                id: productEntry.id,
                product_id: productEntry.product_id,
                quantity: productEntry.quantity,
                notes: productEntry.notes,
                product_name: product?.title,
                format_extras: product?.format_extras,
                format_extra_comments: product?.format_extra_comments
              };
            });
          }
          
          return {
            id: format.id,
            format_id: format.format_id,
            quantity: format.quantity,
            notes: format.notes,
            format_name: formatName,
            products: format.products
          };
        });
      }

      return {
        ...request,
        supplier_name: supplierName,
        formats: request.formats
      };
    });

    return transformedData as QuoteRequest[];
  } catch (error: any) {
    console.error("Error fetching quote requests:", error);
    throw error;
  }
}

/**
 * Fetches a single quote request by ID
 */
export async function fetchQuoteRequestById(id: string) {
  try {
    const { data, error } = await supabase
      .from("quote_requests")
      .select(`
        *,
        supplier:suppliers(supplier_name),
        formats:quote_request_formats(
          id, 
          format_id, 
          quantity, 
          notes,
          format:formats(format_name),
          products:quote_request_format_products(
            id, 
            product_id, 
            quantity, 
            notes,
            product:products(id, title, format_extras, format_extra_comments)
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching quote request:", error);
      throw error;
    }

    const request = data;

    // Map supplier name from the joined supplier object
    const supplierName = request.supplier ? request.supplier.supplier_name : null;

    // Map formats with properly named format information
    if (request.formats) {
      request.formats = request.formats.map((format: any) => {
        // Extract format name from the joined format object
        const formatName = format.format?.format_name;
        
        // Map products with properly named product information
        if (format.products) {
          format.products = format.products.map((productEntry: any) => {
            const product = productEntry.product;
            return {
              id: productEntry.id,
              product_id: productEntry.product_id,
              quantity: productEntry.quantity,
              notes: productEntry.notes,
              product_name: product?.title,
              format_extras: product?.format_extras,
              format_extra_comments: product?.format_extra_comments
            };
          });
        }
        
        return {
          id: format.id,
          format_id: format.format_id,
          quantity: format.quantity,
          notes: format.notes,
          format_name: formatName,
          products: format.products
        };
      });
    }

    const transformedData = {
      ...request,
      supplier_name: supplierName,
      formats: request.formats
    };

    return transformedData as QuoteRequest;
  } catch (error: any) {
    console.error("Error fetching quote request:", error);
    throw error;
  }
}
