
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates organization notifications when quote requests are approved or declined
 */
export async function createQuoteRequestStatusNotification(
  quoteRequestId: string,
  organizationId: string,
  status: 'approved' | 'declined',
  userId: string
): Promise<void> {
  try {
    // Get quote request details
    const { data: quoteRequest, error: fetchError } = await supabase
      .from("quote_requests")
      .select("title, due_date")
      .eq("id", quoteRequestId)
      .single();

    if (fetchError) {
      console.error("Error fetching quote request for notification:", fetchError);
      return;
    }

    // Get user details for the notification
    const { data: userProfile, error: userError } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", userId)
      .single();

    const userName = userProfile?.first_name && userProfile?.last_name 
      ? `${userProfile.first_name} ${userProfile.last_name}`
      : userProfile?.email || 'Unknown User';

    const title = status === 'approved' 
      ? `Quote Request Approved: ${quoteRequest?.title}`
      : `Quote Request Declined: ${quoteRequest?.title}`;

    const message = status === 'approved'
      ? `Quote request "${quoteRequest?.title}" has been approved by ${userName} and is now ready to be sent to suppliers.`
      : `Quote request "${quoteRequest?.title}" has been declined by ${userName}.`;

    // Create the notification
    const { error: notificationError } = await supabase.rpc('create_organization_notification', {
      p_organization_id: organizationId,
      p_notification_type: `quote_request_${status}`,
      p_title: title,
      p_message: message,
      p_data: {
        quote_request_id: quoteRequestId,
        quote_request_title: quoteRequest?.title,
        status,
        approved_by: userId,
        approved_by_name: userName,
        due_date: quoteRequest?.due_date
      },
      p_priority: status === 'approved' ? 'high' : 'normal'
    });

    if (notificationError) {
      console.error("Failed to create quote request status notification:", notificationError);
    }

  } catch (error) {
    console.error("Error creating quote request status notification:", error);
  }
}
