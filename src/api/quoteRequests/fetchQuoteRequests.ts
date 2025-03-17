
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequest } from "@/types/quoteRequest";
import { Organization } from "@/types/organization";

/**
 * Fetches quote requests based on provided parameters
 */
export async function fetchQuoteRequests(
  params: {
    currentOrganization: Organization | null;
    status?: string;
    searchQuery?: string;
  }
): Promise<QuoteRequest[]> {
  const { currentOrganization, status, searchQuery } = params;

  if (!currentOrganization) {
    return [];
  }

  try {
    let query = supabase
      .from("quote_requests")
      .select(`
        *,
        suppliers:supplier_id (supplier_name),
        quote_request_formats(
          id,
          format_id,
          quantity,
          notes,
          formats:format_id(format_name),
          quote_request_format_products(
            id,
            product_id,
            quantity,
            notes,
            products:product_id(id, title)
          )
        )
      `)
      .eq("organization_id", currentOrganization.id);

    if (status && status !== 'all') {
      query = query.eq("status", status);
    }

    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    query = query.order("requested_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    // Get all unique supplier IDs from all requests
    const allSupplierIds = new Set<string>();
    (data || []).forEach(request => {
      if (request.supplier_ids && Array.isArray(request.supplier_ids)) {
        request.supplier_ids.forEach((id: string) => allSupplierIds.add(id));
      }
      // Also add the single supplier_id if it exists and isn't in the array
      if (request.supplier_id && !allSupplierIds.has(request.supplier_id)) {
        allSupplierIds.add(request.supplier_id);
      }
    });

    // Fetch all suppliers in one go if we have any IDs
    let suppliersMap: Record<string, string> = {};
    if (allSupplierIds.size > 0) {
      const { data: suppliersData, error: suppliersError } = await supabase
        .from("suppliers")
        .select("id, supplier_name")
        .in("id", Array.from(allSupplierIds));

      if (suppliersError) throw suppliersError;

      // Create a map of supplier ID to name
      suppliersMap = (suppliersData || []).reduce((acc: Record<string, string>, supplier: any) => {
        acc[supplier.id] = supplier.supplier_name;
        return acc;
      }, {});
    }

    // Transform the data to make it compatible with our QuoteRequest type
    return (data || []).map(item => {
      // Map quote_request_formats to our expected formats structure
      const formats = (item.quote_request_formats || []).map((f: any) => ({
        id: f.id,
        quote_request_id: item.id,
        format_id: f.format_id,
        quantity: f.quantity,
        notes: f.notes,
        format_name: f.formats?.format_name,
        products: (f.quote_request_format_products || []).map((p: any) => ({
          id: p.id,
          product_id: p.product_id,
          quantity: p.quantity,
          notes: p.notes,
          product_name: p.products?.title
        }))
      }));

      // Map supplier IDs to names
      const supplier_names = item.supplier_ids && Array.isArray(item.supplier_ids)
        ? item.supplier_ids.map((id: string) => suppliersMap[id] || 'Unknown')
        : [];
      
      return {
        ...item,
        supplier_name: item.suppliers?.supplier_name || (supplier_names.length > 0 ? supplier_names[0] : 'Unknown'),
        supplier_names: supplier_names,
        formats: formats
      } as QuoteRequest;
    });
  } catch (error: any) {
    console.error("Error fetching quote requests:", error);
    throw error;
  }
}
