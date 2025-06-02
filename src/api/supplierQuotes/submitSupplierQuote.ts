
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuote } from "@/types/supplierQuote";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";

/**
 * Submits a supplier quote and creates notifications for the organization
 */
export async function submitSupplierQuote(
  id: string,
  userId: string
): Promise<SupplierQuote | null> {
  try {
    // Get the current state before updating
    const { data: currentQuote, error: fetchError } = await supabase
      .from("supplier_quotes")
      .select(`
        *,
        quote_requests!inner(
          title,
          organization_id,
          organizations!inner(name)
        ),
        suppliers!inner(supplier_name)
      `)
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Update the status to submitted
    const { data, error } = await supabase
      .from("supplier_quotes")
      .update({ 
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Record the audit trail
    await recordSupplierQuoteAudit(
      id,
      userId,
      { status: currentQuote.status },
      { status: 'submitted' },
      'quote_submitted'
    );

    // Create organization notification about the quote submission
    if (currentQuote.quote_requests?.organization_id) {
      try {
        const { error: notificationError } = await supabase.rpc('create_organization_notification', {
          p_organization_id: currentQuote.quote_requests.organization_id,
          p_notification_type: 'supplier_quote_submitted',
          p_title: `New Quote Submitted by ${currentQuote.suppliers?.supplier_name}`,
          p_message: `A quote has been submitted for "${currentQuote.quote_requests?.title}". Review and respond to proceed.`,
          p_data: {
            supplier_quote_id: id,
            quote_request_id: currentQuote.quote_request_id,
            supplier_name: currentQuote.suppliers?.supplier_name,
            quote_request_title: currentQuote.quote_requests?.title
          },
          p_priority: 'normal'
        });

        if (notificationError) {
          console.error("Failed to create organization notification:", notificationError);
          // Don't throw error - notification failure shouldn't block quote submission
        }
      } catch (notificationError) {
        console.error("Error creating organization notification:", notificationError);
        // Don't throw error - notification failure shouldn't block quote submission
      }
    }

    return data as SupplierQuote;
  } catch (error: any) {
    console.error("Error submitting supplier quote:", error);
    throw error;
  }
}
