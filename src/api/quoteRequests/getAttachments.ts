
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequestAttachment } from "@/types/quoteRequest";

export async function getQuoteRequestAttachments(quoteRequestId: string): Promise<QuoteRequestAttachment[]> {
  const { data, error } = await supabase
    .from('quote_request_attachments')
    .select('*')
    .eq('quote_request_id', quoteRequestId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching quote request attachments:", error);
    return [];
  }

  return data as unknown as QuoteRequestAttachment[];
}
