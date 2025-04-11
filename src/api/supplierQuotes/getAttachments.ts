
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuoteAttachment } from "@/types/supplierQuote";

export async function getAttachments(quoteId: string): Promise<SupplierQuoteAttachment[]> {
  // Use the RPC function to get attachments
  const { data, error } = await supabase
    .rpc('get_quote_attachments', { quote_id: quoteId });

  if (error) {
    console.error("Error fetching attachments:", error);
    return [];
  }

  return data as SupplierQuoteAttachment[];
}

// For backward compatibility
export const getSupplierQuoteAttachments = getAttachments;

