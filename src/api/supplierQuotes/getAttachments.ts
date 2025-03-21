
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuoteAttachment } from "@/types/supplierQuote";

export async function getSupplierQuoteAttachments(quoteId: string): Promise<SupplierQuoteAttachment[]> {
  // Use a direct SQL query to bypass type system limitations
  const { data, error } = await supabase
    .from('supplier_quote_attachments')
    .select('*')
    .eq('supplier_quote_id', quoteId);

  if (error) {
    console.error("Error fetching attachments:", error);
    return [];
  }

  return data as unknown as SupplierQuoteAttachment[];
}
