
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequest } from "@/types/quoteRequest";
import { recordQuoteRequestAudit } from "./quoteRequestAudit";
import { sendQuoteRequestApprovalNotifications } from "./sendQuoteRequestApprovalNotifications";

/**
 * Updates the status of a quote request
 */
export async function updateQuoteRequestStatus(
  id: string,
  status: 'pending' | 'approved' | 'declined',
  userId: string
): Promise<QuoteRequest | null> {
  try {
    // Get the current state before updating
    const { data: currentRequest, error: fetchError } = await supabase
      .from("quote_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Update the status
    const { data, error } = await supabase
      .from("quote_requests")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Record the audit trail for the status change
    await recordQuoteRequestAudit(
      id,
      userId,
      { status: currentRequest.status as 'pending' | 'approved' | 'declined' },
      { status } as Partial<QuoteRequest>,
      'status_change'
    );

    // If the status is being set to approved, send notifications to suppliers
    if (status === 'approved' && currentRequest.status !== 'approved') {
      console.log("Quote request approved, sending notifications to suppliers");
      // Fire and forget - don't block the status update if notifications fail
      sendQuoteRequestApprovalNotifications(id, currentRequest.organization_id)
        .catch(error => {
          console.error("Failed to send approval notifications:", error);
        });
    }

    return data as QuoteRequest;
  } catch (error: any) {
    console.error("Error updating quote request status:", error);
    throw error;
  }
}
