// import { Organization } from "@/types/organization";
// import { supabase } from "@/integrations/supabase/client";
// import { SupplierQuote, SupplierQuoteStatus, SupplierQuoteFormat } from "@/types/supplierQuote";

// interface FetchQuotesParams {
//   currentOrganization: Organization | null;
//   status?: string;
//   supplierId?: string;
//   quoteRequestId?: string;
//   searchQuery?: string;
//   productId?: string;
//   formatId?: string;
//   supplier?: string;
//   selectedFormat?: string;
// }

// export async function fetchSupplierQuotes(params: FetchQuotesParams): Promise<SupplierQuote[]> {
//   const { currentOrganization, status, supplierId, quoteRequestId, searchQuery, productId, formatId, supplier, selectedFormat } = params;

//   if (!currentOrganization) {
//     return [];
//   }

//   // let query = supabase
//   //   .from("supplier_quotes")
//   //   .select(
//   //     `
//   //     *,
//   //     quote_request:quote_requests(
//   //       id,
//   //       title,
//   //       description,
//   //       due_date,
//   //       formats:quote_request_formats(
//   //         id,
//   //         format_id,
//   //         format:formats(id, format_name),
//   //         products:quote_request_format_products(
//   //           id,
//   //           product_id,
//   //           quantity,
//   //           notes
//   //         )
//   //       )
//   //     ),
//   //     supplier:suppliers(id, supplier_name),
//   //     formats:supplier_quote_formats(*, format:formats(id, format_name)),
//   //     price_breaks:supplier_quote_price_breaks(*)
//   //   `
//   //   )
//   //   .eq("organization_id", currentOrganization.id);

//   let query = supabase.from("quote_management_view").select("*").eq("organization_id", currentOrganization.id);

//   // Apply status filter if provided
//   if (status) {
//     const statuses = status.split(",");
//     if (statuses.length > 0) {
//       query = query.in("status", statuses);
//     }
//   }

//   // Apply supplier filter if provided
//   if (supplierId) {
//     query = query.eq("supplier_id", supplierId);
//   }

//   // Apply quote request filter if provided
//   if (quoteRequestId) {
//     query = query.eq("quote_request_id", quoteRequestId);
//   }

//   if (productId || formatId) {
//     // Handle product and format filtering based on relationships
//     // We need to find quote request formats that match our criteria
//     let formatsQuery = supabase.from("quote_request_formats").select(`
//         id,
//         products:quote_request_format_products(
//           product_id
//         )
//       `);

//     if (formatId) {
//       // Direct format match
//       formatsQuery = formatsQuery.eq("format_id", formatId);
//     }

//     if (productId) {
//       // Find formats with this product linked - use proper join
//       formatsQuery = formatsQuery.eq("products.product_id", productId);
//     }

//     const { data: matchingFormats, error: formatsError } = await formatsQuery;

//     if (formatsError) {
//       console.error("Error finding matching formats:", formatsError);
//       throw formatsError;
//     }

//     if (matchingFormats && matchingFormats.length > 0) {
//       // Get the format IDs to filter by
//       const formatIds = matchingFormats.map((f) => f.id);

//       // Filter supplier quotes where price breaks have one of these format IDs
//       query = query.in("price_breaks.quote_request_format_id", formatIds);
//     } else {
//       // No matching formats found, return empty result
//       return [];
//     }
//   } else if (searchQuery && searchQuery.trim() !== "") {
//     // Apply general search if no specific productId/formatId filters
//     const searchTerm = searchQuery.trim().toLowerCase();
//     // query = query.or(`
//     //   reference_id.ilike.%${searchTerm}%,
//     //   supplier.supplier_name.ilike.%${searchTerm}%,
//     //   quote_request.title.ilike.%${searchTerm}%
//     // `);
//     query = query.or(`title.ilike.%${searchTerm}%`);
//   }

//   if (selectedFormat && selectedFormat.trim() !== "") {
//     query = query.or(`quote_request.formats.format_id.ilike.%${supplier}%`);
//   }

//   if (supplier && supplier.trim() !== "") {
//     query = query.or(`supplier_name.ilike.%${supplier}%`);
//   }

//   // Order by created_at in descending order
//   query = query.order("created_at", { ascending: false });

//   const { data, error } = await query;

//   if (error) {
//     console.error("Error fetching supplier quotes:", error);
//     throw error;
//   }

//   // Transform the data to match the SupplierQuote type
//   const formattedQuotes =
//     data?.map((quote) => {
//       // Format the formats array to ensure it has format_name
//       const formattedFormats: SupplierQuoteFormat[] =
//         quote.formats?.map((format: any) => ({
//           id: format.id,
//           supplier_quote_id: format.supplier_quote_id,
//           format_id: format.format_id,
//           quote_request_format_id: format.quote_request_format_id,
//           format_name: format.format?.format_name || "Unknown Format",
//         })) || [];

//       // Return a properly typed SupplierQuote
//       return {
//         ...quote,
//         formats: formattedFormats,
//       } as SupplierQuote;
//     }) || [];

//   return formattedQuotes;
// }

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
  supplier?: string;
  selectedFormat?: string;
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
    supplier,
    selectedFormat,
  } = params;

  if (!currentOrganization) {
    return [];
  }

  // Prepare filters for the RPC
  const search_title =
    searchQuery && searchQuery.trim() !== "" ? searchQuery.trim() : null;
  const filter_supplier_name =
    supplier && supplier.trim() !== "" ? supplier.trim() : null;
  // Use selectedFormat or formatId as your filter
  const filter_format_id =
    selectedFormat && selectedFormat.trim() !== ""
      ? selectedFormat.trim()
      : formatId && formatId.trim() !== ""
      ? formatId.trim()
      : null;

  // Call the RPC function with filters
  const { data, error } = await supabase.rpc("test_search_quotes", {
    search_title,
    filter_supplier_name,
    filter_format_id,
  });

  if (error) {
    console.error("Error fetching supplier quotes:", error);
    throw error;
  }

  // Optionally, filter organization_id, quoteRequestId, supplierId, status in JS (or add to your RPC)
  let filteredData = data || [];
  if (currentOrganization?.id) {
    filteredData = filteredData.filter(
      (q) => q.organization_id === currentOrganization.id
    );
  }
  if (status) {
    const statuses = status.split(",");
    filteredData = filteredData.filter((q) => statuses.includes(q.status));
  }
  if (supplierId) {
    filteredData = filteredData.filter((q) => q.supplier_id === supplierId);
  }
  if (quoteRequestId) {
    filteredData = filteredData.filter(
      (q) => q.quote_request_id === quoteRequestId
    );
  }

  // Transform the data to match the SupplierQuote type

  // const formattedQuotes = filteredData.map((quote) => {
  //   const formattedFormats: SupplierQuoteFormat[] =
  //     quote.formats?.map((format: any) => ({
  //       id: format.id,
  //       supplier_quote_id: format.supplier_quote_id,
  //       format_id: format.format_id,
  //       quote_request_format_id: format.quote_request_format_id,
  //       format_name: format.format?.format_name || "Unknown Format",
  //     })) || [];

  //   return {
  //     ...quote,
  //     formats: formattedFormats,
  //   } as SupplierQuote;
  // });

  return filteredData;
}
