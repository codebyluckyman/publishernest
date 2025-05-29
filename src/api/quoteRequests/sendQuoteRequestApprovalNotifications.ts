
import { supabase } from "@/integrations/supabase/client";

/**
 * Sends notifications to all suppliers when a quote request is approved
 */
export async function sendQuoteRequestApprovalNotifications(
  quoteRequestId: string,
  organizationId: string
): Promise<void> {
  try {
    console.log("Starting notification process for quote request:", quoteRequestId);

    // Fetch the organization name
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organizationId)
      .single();

    if (orgError) {
      console.error("Error fetching organization:", orgError);
      throw orgError;
    }

    // Fetch the quote request details including supplier_ids and title
    const { data: quoteRequest, error: quoteError } = await supabase
      .from("quote_requests")
      .select("title, supplier_ids, due_date")
      .eq("id", quoteRequestId)
      .single();

    if (quoteError) {
      console.error("Error fetching quote request:", quoteError);
      throw quoteError;
    }

    if (!quoteRequest || !quoteRequest.supplier_ids || quoteRequest.supplier_ids.length === 0) {
      console.log("No suppliers found for quote request or invalid data");
      return;
    }

    console.log("Found suppliers:", quoteRequest.supplier_ids);

    // Get all supplier users for the invited suppliers
    const { data: supplierUsers, error: usersError } = await supabase
      .from("supplier_users")
      .select("user_id, supplier_id")
      .in("supplier_id", quoteRequest.supplier_ids);

    if (usersError) {
      console.error("Error fetching supplier users:", usersError);
      throw usersError;
    }

    if (!supplierUsers || supplierUsers.length === 0) {
      console.log("No supplier users found for the invited suppliers");
      return;
    }

    console.log("Found supplier users:", supplierUsers);

    // Calculate expiration date based on due_date or default to 30 days
    const expiresAt = quoteRequest.due_date 
      ? new Date(quoteRequest.due_date) 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    // Create the notification title with organization name
    const notificationTitle = `New Quote Request from ${organization.name}`;

    // Create notifications for each supplier user
    const notificationPromises = supplierUsers.map(async (supplierUser) => {
      try {
        const { error: notificationError } = await supabase.rpc('create_supplier_notification', {
          p_supplier_id: supplierUser.supplier_id,
          p_user_id: supplierUser.user_id,
          p_notification_type: 'new_quote_request',
          p_title: notificationTitle,
          p_message: `Quote request "${quoteRequest.title}" has been approved and is now available for your response.`,
          p_quote_request_id: quoteRequestId,
          p_expires_at: expiresAt.toISOString()
        });

        if (notificationError) {
          console.error("Error creating notification for user:", supplierUser.user_id, notificationError);
        } else {
          console.log("Notification created successfully for user:", supplierUser.user_id);
          
          // Log the delivery
          await supabase
            .from("notification_delivery_log")
            .insert({
              quote_request_id: quoteRequestId,
              supplier_id: supplierUser.supplier_id,
              reminder_type: 'new_quote_request'
            });
        }
      } catch (error) {
        console.error("Error processing notification for user:", supplierUser.user_id, error);
      }
    });

    // Wait for all notifications to be processed
    await Promise.all(notificationPromises);
    console.log("All notifications processed for quote request:", quoteRequestId);

  } catch (error) {
    console.error("Error in sendQuoteRequestApprovalNotifications:", error);
    // Don't throw the error to prevent blocking the quote request status update
  }
}
