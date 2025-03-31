
import { supabase } from "@/integrations/supabase/client";

export async function checkExistingQuote(
  quoteRequestId: string,
  supplierId: string,
  organizationId: string
): Promise<{ exists: boolean; quoteId: string | null }> {
  const { data, error } = await supabase
    .from("supplier_quotes")
    .select("id, status")
    .eq("quote_request_id", quoteRequestId)
    .eq("supplier_id", supplierId)
    .eq("organization_id", organizationId)
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "No rows returned" error
    console.error("Error checking for existing quote:", error);
    throw new Error(`Error checking for existing quote: ${error.message}`);
  }

  return {
    exists: !!data,
    quoteId: data?.id || null
  };
}
