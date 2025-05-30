
import { supabase } from "@/integrations/supabase/client";

/**
 * Sends notifications to supplier users when their quote is approved
 */
export async function sendSupplierQuoteApprovalNotifications(
  supplierQuoteId: string,
  organizationId: string,
  approvedCost: number
): Promise<void> {
  try {
    console.log("Starting supplier quote approval notification process for:", supplierQuoteId);

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

    // Fetch the supplier quote details including reference_id and related quote request
    const { data: supplierQuote, error: quoteError } = await supabase
      .from("supplier_quotes")
      .select(`
        id,
        reference_id,
        reference,
        supplier_id,
        quote_request:quote_requests(title)
      `)
      .eq("id", supplierQuoteId)
      .single();

    if (quoteError) {
      console.error("Error fetching supplier quote:", quoteError);
      throw quoteError;
    }

    if (!supplierQuote || !supplierQuote.supplier_id) {
      console.log("No supplier found for quote or invalid data");
      return;
    }

    console.log("Found supplier quote:", supplierQuote.reference_id || supplierQuote.id);

    // Get all supplier users for this supplier
    const { data: supplierUsers, error: usersError } = await supabase
      .from("supplier_users")
      .select("user_id, supplier_id")
      .eq("supplier_id", supplierQuote.supplier_id);

    if (usersError) {
      console.error("Error fetching supplier users:", usersError);
      throw usersError;
    }

    if (!supplierUsers || supplierUsers.length === 0) {
      console.log("No supplier users found for the supplier");
      return;
    }

    console.log("Found supplier users:", supplierUsers);

    // Create the notification title and message
    const quoteReference = supplierQuote.reference_id || supplierQuote.reference || supplierQuote.id;
    const notificationTitle = `Quote Approved by ${organization.name}`;
    const quoteRequestTitle = supplierQuote.quote_request?.title || "Quote Request";
    
    const notificationMessage = `Great news! Your quote ${quoteReference} for "${quoteRequestTitle}" has been approved with a total cost of ${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(approvedCost)}. You can view the details in your dashboard.`;

    // Create notifications for each supplier user
    const notificationPromises = supplierUsers.map(async (supplierUser) => {
      try {
        const { error: notificationError } = await supabase.rpc('create_supplier_notification', {
          p_supplier_id: supplierUser.supplier_id,
          p_user_id: supplierUser.user_id,
          p_notification_type: 'quote_approved',
          p_title: notificationTitle,
          p_message: notificationMessage,
          p_quote_request_id: null, // This is for a quote approval, not a new quote request
          p_expires_at: null // No expiration for approval notifications
        });

        if (notificationError) {
          console.error("Error creating notification for user:", supplierUser.user_id, notificationError);
        } else {
          console.log("Notification created successfully for user:", supplierUser.user_id);
        }
      } catch (error) {
        console.error("Error processing notification for user:", supplierUser.user_id, error);
      }
    });

    // Wait for all notifications to be processed
    await Promise.all(notificationPromises);
    console.log("All approval notifications processed for supplier quote:", supplierQuoteId);

  } catch (error) {
    console.error("Error in sendSupplierQuoteApprovalNotifications:", error);
    // Don't throw the error to prevent blocking the quote approval process
  }
}
