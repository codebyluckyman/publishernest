
import { Organization } from "@/types/organization";
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuote, SupplierQuoteStatus } from "@/types/supplierQuote";

interface FetchQuotesParams {
  currentOrganization: Organization | null;
  status?: string;
  supplierId?: string;
  quoteRequestId?: string;
  searchQuery?: string;
}

export async function fetchSupplierQuotes(params: FetchQuotesParams): Promise<SupplierQuote[]> {
  const { currentOrganization, status, supplierId, quoteRequestId, searchQuery } = params;

  if (!currentOrganization) {
    return [];
  }

  let query = supabase
    .from("supplier_quotes")
    .select(`
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
      supplier:suppliers(id, supplier_name)
    `)
    .eq("organization_id", currentOrganization.id);

  // Apply status filter if provided
  if (status) {
    const statuses = status.split(',');
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

  // Parse the search query to handle product_id and format_id
  if (searchQuery && searchQuery.trim() !== '') {
    // Extract product_id and format_id from searchQuery if they exist
    const productIdMatch = searchQuery.match(/product_id:([a-zA-Z0-9-]+)/);
    const formatIdMatch = searchQuery.match(/format_id:([a-zA-Z0-9-]+)/);
    
    const productId = productIdMatch ? productIdMatch[1] : null;
    const formatId = formatIdMatch ? formatIdMatch[1] : null;
    
    if (productId && formatId && searchQuery.includes(" OR ")) {
      // If both IDs are present with OR logic, we need to filter for either
      query = query.or(`supplier_quote_price_breaks.product_id.eq.${productId},supplier_quote_formats.format_id.eq.${formatId}`);
    } else if (productId) {
      // Find quotes that have price breaks with the matching product ID
      query = query.filter('supplier_quote_price_breaks.product_id', 'eq', productId);
    } else if (formatId) {
      // Find quotes that have formats with the matching format ID
      query = query.filter('supplier_quote_formats.format_id', 'eq', formatId);
    } else {
      // Apply general search if no specific fields were extracted
      const searchTerm = searchQuery.trim().toLowerCase();
      query = query.or(`
        reference_id.ilike.%${searchTerm}%,
        supplier.supplier_name.ilike.%${searchTerm}%,
        quote_request.title.ilike.%${searchTerm}%
      `);
    }
  }

  // Order by created_at in descending order
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching supplier quotes:", error);
    throw error;
  }

  // Fetch formats and price breaks for each quote
  const quotesWithDetails = await Promise.all(
    (data || []).map(async (quote) => {
      // Fetch supplier quote formats
      const { data: formats, error: formatsError } = await supabase
        .from("supplier_quote_formats")
        .select(`
          *,
          format:formats(id, format_name)
        `)
        .eq("supplier_quote_id", quote.id);

      if (formatsError) {
        console.error("Error fetching formats for quote:", formatsError);
      }

      // Fetch price breaks for the quote
      const { data: priceBreaks, error: priceBreaksError } = await supabase
        .from("supplier_quote_price_breaks")
        .select("*")
        .eq("supplier_quote_id", quote.id);

      if (priceBreaksError) {
        console.error("Error fetching price breaks for quote:", priceBreaksError);
      }

      // Create a properly typed SupplierQuote object
      const typedQuote: SupplierQuote = {
        ...quote,
        status: quote.status as SupplierQuoteStatus,
        production_schedule: quote.production_schedule as Record<string, string | null> | null,
        quote_request: quote.quote_request ? {
          id: quote.quote_request.id,
          organization_id: currentOrganization.id,
          supplier_id: null,
          supplier_ids: [],
          title: quote.quote_request.title,
          description: quote.quote_request.description,
          status: 'pending',
          requested_by: '',
          requested_at: '',
          updated_at: '',
          due_date: quote.quote_request.due_date,
          currency: quote.currency,
          formats: quote.quote_request.formats,
          products: null,
          quantities: null,
          notes: null,
          production_schedule_requested: false
        } : undefined,
        formats: formats ? formats.map(f => ({
          id: f.id,
          format_id: f.format_id,
          quote_request_format_id: f.quote_request_format_id,
          format_name: f.format?.format_name || "Unknown Format"
        })) : [],
        price_breaks: priceBreaks || []
      };

      return typedQuote;
    })
  );

  return quotesWithDetails as SupplierQuote[];
}
