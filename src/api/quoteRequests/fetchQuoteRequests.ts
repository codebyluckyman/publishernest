
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequest, QuoteRequestFormat, QuoteRequestFormatProduct, PriceBreak } from "@/types/quoteRequest";

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
export async function fetchQuoteRequests({ 
  currentOrganization, 
  status, 
  searchQuery 
}: { 
  currentOrganization: { id: string } | null; 
  status?: string; 
  searchQuery?: string;
}) {
  if (!currentOrganization) return [];
  
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
          ),
          price_breaks:quote_request_format_price_breaks(
            id,
            from_quantity,
            to_quantity,
            one_product_price,
            two_products_price,
            three_products_price,
            four_products_price
          )
        )
      `)
      .eq("organization_id", currentOrganization.id);

    // Apply filters
    let query = applySearchFilter(initialQuery, searchQuery || '');
    query = applyStatusFilter(query, status || '');

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
      let formattedFormats: QuoteRequestFormat[] = [];
      
      if (request.formats && request.formats.length > 0) {
        formattedFormats = request.formats.map((format: any) => {
          // Map products with properly named product information
          let formattedProducts: QuoteRequestFormatProduct[] = [];
          
          if (format.products && format.products.length > 0) {
            formattedProducts = format.products.map((productEntry: any) => {
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
          
          // Map price breaks
          let formattedPriceBreaks: PriceBreak[] = [];
          
          if (format.price_breaks && format.price_breaks.length > 0) {
            formattedPriceBreaks = format.price_breaks.map((priceBreak: any) => {
              return {
                id: priceBreak.id,
                quote_request_format_id: format.id,
                from_quantity: priceBreak.from_quantity,
                to_quantity: priceBreak.to_quantity,
                one_product_price: priceBreak.one_product_price,
                two_products_price: priceBreak.two_products_price,
                three_products_price: priceBreak.three_products_price,
                four_products_price: priceBreak.four_products_price
              };
            });
          }
          
          return {
            id: format.id,
            format_id: format.format_id,
            quote_request_id: request.id,
            quantity: format.quantity,
            notes: format.notes || "",
            format_name: format.format?.format_name,
            products: formattedProducts,
            price_breaks: formattedPriceBreaks
          };
        });
      }

      return {
        ...request,
        supplier_name: supplierName,
        formats: formattedFormats
      } as QuoteRequest;
    });

    return transformedData;
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
          ),
          price_breaks:quote_request_format_price_breaks(
            id,
            from_quantity,
            to_quantity,
            one_product_price,
            two_products_price,
            three_products_price,
            four_products_price
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
    let formattedFormats: QuoteRequestFormat[] = [];
    
    if (request.formats && request.formats.length > 0) {
      formattedFormats = request.formats.map((format: any) => {
        // Map products with properly named product information
        let formattedProducts: QuoteRequestFormatProduct[] = [];
        
        if (format.products && format.products.length > 0) {
          formattedProducts = format.products.map((productEntry: any) => {
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
        
        // Map price breaks
        let formattedPriceBreaks: PriceBreak[] = [];
        
        if (format.price_breaks && format.price_breaks.length > 0) {
          formattedPriceBreaks = format.price_breaks.map((priceBreak: any) => {
            return {
              id: priceBreak.id,
              quote_request_format_id: format.id,
              from_quantity: priceBreak.from_quantity,
              to_quantity: priceBreak.to_quantity,
              one_product_price: priceBreak.one_product_price,
              two_products_price: priceBreak.two_products_price,
              three_products_price: priceBreak.three_products_price,
              four_products_price: priceBreak.four_products_price
            };
          });
        }
        
        return {
          id: format.id,
          format_id: format.format_id,
          quote_request_id: request.id,
          quantity: format.quantity,
          notes: format.notes || "",
          format_name: format.format?.format_name,
          products: formattedProducts,
          price_breaks: formattedPriceBreaks
        };
      });
    }

    const transformedData = {
      ...request,
      supplier_name: supplierName,
      formats: formattedFormats
    } as QuoteRequest;

    return transformedData;
  } catch (error: any) {
    console.error("Error fetching quote request:", error);
    throw error;
  }
}
