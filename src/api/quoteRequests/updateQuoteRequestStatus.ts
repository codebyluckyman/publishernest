
import { supabase } from "@/integrations/supabase/client";
import { QuoteRequest } from "@/types/quoteRequest";
import { recordQuoteRequestAudit } from "./quoteRequestAudit";
import { sendQuoteRequestApprovalNotifications } from "./sendQuoteRequestApprovalNotifications";
import { fetchOrganizationReminderSettings } from "@/api/organizations/reminderSettings";
import { createQuoteRequestStatusNotification } from "./createQuoteRequestNotifications";

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

    // Create organization notification for status change
    if (status !== currentRequest.status) {
      await createQuoteRequestStatusNotification(
        id,
        currentRequest.organization_id,
        status,
        userId
      );
    }

    // If the status is being set to approved, check organization settings and send notifications
    if (status === 'approved' && currentRequest.status !== 'approved') {
      console.log("Quote request approved, checking notification settings");
      
      try {
        // Fetch organization reminder settings to check if notifications are enabled
        const reminderSettings = await fetchOrganizationReminderSettings(currentRequest.organization_id);
        
        // Only send notifications if the setting is enabled (defaults to true if no settings found)
        const shouldSendNotifications = reminderSettings?.issue_quote_notifications_enabled ?? true;
        
        if (shouldSendNotifications) {
          console.log("Sending approval notifications to suppliers");
          // Fire and forget - don't block the status update if notifications fail
          sendQuoteRequestApprovalNotifications(id, currentRequest.organization_id)
            .catch(error => {
              console.error("Failed to send approval notifications:", error);
            });
        } else {
          console.log("Quote request notifications are disabled for this organization");
        }
      } catch (settingsError) {
        console.error("Error fetching notification settings, skipping notifications:", settingsError);
      }
    }

    return data as QuoteRequest;
  } catch (error: any) {
    console.error("Error updating quote request status:", error);
    throw error;
  }
}
