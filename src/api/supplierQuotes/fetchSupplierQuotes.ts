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
  } = params;

  if (!currentOrganization) {
    return [];
  }

  let query = supabase
    .from("supplier_quotes")
    .select(
      `
      *,
      quote_request:quote_requests(
        id, 
        title, 
        description, 
        due_date,
        formats:quote_request_formats(
          id,
          format_id,
          format:formats(id, format_name),
          products:quote_request_format_products(
            id,
            product_id,
            quantity,
            notes
          )
        )
      ),
      supplier:suppliers(id, supplier_name),
      formats:supplier_quote_formats(*, format:formats(id, format_name)),
      price_breaks:supplier_quote_price_breaks(*)
    `
    )
    .eq("organization_id", currentOrganization.id);

  // Apply status filter if provided
  if (status) {
    const statuses = status.split(",");
    if (statuses.length > 0) {
      query = query.in("status", statuses);
    }
  }

  // Apply supplier filter if provided
  if (supplierId) {
    query = query.eq("supplier_id", supplierId);
  }

  // Apply quote request filter if provided
  if (quoteRequestId) {
    query = query.eq("quote_request_id", quoteRequestId);
  }

  // Handle product and format filtering based on relationships
  if (productId || formatId) {
    // We need to find quote request formats that match our criteria
    let formatsQuery = supabase.from("quote_request_formats").select(`
        id,
        products:quote_request_format_products(
          product_id
        )
      `);

    if (formatId) {
      // Direct format match
      formatsQuery = formatsQuery.eq("format_id", formatId);
    }

    if (productId) {
      // Find formats with this product linked - use proper join
      formatsQuery = formatsQuery.eq("products.product_id", productId);
    }

    const { data: matchingFormats, error: formatsError } = await formatsQuery;

    if (formatsError) {
      console.error("Error finding matching formats:", formatsError);
      throw formatsError;
    }

    if (matchingFormats && matchingFormats.length > 0) {
      // Get the format IDs to filter by
      const formatIds = matchingFormats.map((f) => f.id);

      // Filter supplier quotes where price breaks have one of these format IDs
      query = query.in("price_breaks.quote_request_format_id", formatIds);
    } else {
      // No matching formats found, return empty result
      return [];
    }
  } else if (searchQuery && searchQuery.trim() !== "") {
    // Apply general search if no specific productId/formatId filters
    const searchTerm = searchQuery.trim().toLowerCase();
    query = query.or(`
      reference_id.ilike.%${searchTerm}%,
      supplier.supplier_name.ilike.%${searchTerm}%,
      quote_request.title.ilike.%${searchTerm}%
    `);
  }

  // Order by created_at in descending order
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching supplier quotes:", error);
    throw error;
  }

  // Transform the data to match the SupplierQuote type
  const formattedQuotes =
    data?.map((quote) => {
      // Format the formats array to ensure it has format_name
      const formattedFormats: SupplierQuoteFormat[] =
        quote.formats?.map((format: any) => ({
          id: format.id,
          supplier_quote_id: format.supplier_quote_id,
          format_id: format.format_id,
          quote_request_format_id: format.quote_request_format_id,
          format_name: format.format?.format_name || "Unknown Format",
        })) || [];

      // Return a properly typed SupplierQuote
      return {
        ...quote,
        formats: formattedFormats,
      } as SupplierQuote;
    }) || [];

  return formattedQuotes;
}
