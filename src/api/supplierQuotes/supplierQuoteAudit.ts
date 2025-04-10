
import { supabase } from "@/integrations/supabase/client";

export async function fetchSupplierQuoteAudit(quoteId: string) {
  const { data, error } = await supabase
    .from("supplier_quote_audit")
    .select("*")
    .eq("supplier_quote_id", quoteId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Error fetching supplier quote audit: ${error.message}`);
  }

  return data || [];
}

export async function recordSupplierQuoteAudit(
  quoteId: string,
  userId: string,
  action: string,
  changes: Record<string, any>
) {
  const { data, error } = await supabase
    .from("supplier_quote_audit")
    .insert({
      supplier_quote_id: quoteId,
      changed_by: userId,
      action,
      changes
    });

  if (error) {
    throw new Error(`Error recording supplier quote audit: ${error.message}`);
  }

  return data;
}
