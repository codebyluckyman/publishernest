
import { supabase } from "@/integrations/supabase/client";

export interface SupplierQuoteAudit {
  id: string;
  supplier_quote_id: string | null;
  changed_by: string | null;
  action: 'create' | 'update' | 'submit' | 'accept' | 'decline' | 'approve' | 'reject' | 'delete';
  changes: any; // Using any here as the JSONB structure could vary
  created_at: string;
  changed_by_user?: { email: string } | undefined;
}

export async function recordSupplierQuoteAudit(
  supplierQuoteId: string,
  userId: string,
  action: 'create' | 'update' | 'submit' | 'accept' | 'decline' | 'approve' | 'reject' | 'delete',
  changes: Record<string, any>
): Promise<void> {
  const { error } = await supabase
    .from("supplier_quote_audit")
    .insert({
      supplier_quote_id: supplierQuoteId,
      changed_by: userId,
      action,
      changes
    });

  if (error) {
    console.error("Error recording supplier quote audit:", error);
    // Don't throw here, just log the error since this is an auxiliary operation
  }
}

export async function fetchSupplierQuoteAudit(supplierQuoteId: string): Promise<SupplierQuoteAudit[]> {
  const { data, error } = await supabase
    .from("supplier_quote_audit")
    .select(`
      *,
      changed_by_user:profiles(email)
    `)
    .eq("supplier_quote_id", supplierQuoteId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Error fetching supplier quote audit: ${error.message}`);
  }

  // Type cast the data to our SupplierQuoteAudit interface
  return data as unknown as SupplierQuoteAudit[];
}
