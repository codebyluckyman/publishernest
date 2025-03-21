
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuote } from "@/types/supplierQuote";
import { Organization } from "@/types/organization";

interface FetchSupplierQuotesParams {
  currentOrganization: Organization | null;
  status?: string;
  supplierId?: string;
  quoteRequestId?: string;
  searchQuery?: string;
}

export async function fetchSupplierQuotes({
  currentOrganization,
  status,
  supplierId,
  quoteRequestId,
  searchQuery
}: FetchSupplierQuotesParams): Promise<SupplierQuote[]> {
  if (!currentOrganization) {
    return [];
  }

  let query = supabase
    .from("supplier_quotes")
    .select(`
      *,
      quote_requests(id, title, status, requested_at, due_date),
      supplier:suppliers(id, supplier_name)
    `)
    .eq("organization_id", currentOrganization.id);

  if (status) {
    query = query.eq("status", status);
  }

  if (supplierId) {
    query = query.eq("supplier_id", supplierId);
  }

  if (quoteRequestId) {
    query = query.eq("quote_request_id", quoteRequestId);
  }

  if (searchQuery) {
    query = query.textSearch('quote_requests.title', searchQuery);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Error fetching supplier quotes: ${error.message}`);
  }

  return data as unknown as SupplierQuote[];
}
