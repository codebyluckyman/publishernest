
import { supabaseCustom } from "@/integrations/supabase/client-custom";

export async function submitSupplierQuote(
  id: string,
  totalCost: number
): Promise<void> {
  // Update the supplier quote status to submitted and set submitted_at
  const { error: updateError } = await supabaseCustom
    .from('supplier_quotes')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      total_cost: totalCost
    })
    .eq('id', id);

  if (updateError) {
    console.error('Error submitting supplier quote:', updateError);
    throw updateError;
  }

  // Get the quote request details for notifications
  const { data: quoteData, error: quoteError } = await supabaseCustom
    .from('supplier_quotes')
    .select(`
      id,
      quote_request_id,
      supplier_id,
      quote_request:quote_requests!inner(
        title,
        requested_by,
        organization_id
      ),
      supplier:suppliers!inner(
        supplier_name
      )
    `)
    .eq('id', id)
    .single();

  if (quoteError) {
    console.error('Error fetching quote for notifications:', quoteError);
    return; // Don't throw here as the quote was already submitted successfully
  }

  // Create notification for the quote request creator
  if (quoteData?.quote_request) {
    try {
      await supabaseCustom.rpc('create_organization_notification', {
        p_organization_id: quoteData.quote_request.organization_id,
        p_notification_type: 'quote_submitted',
        p_title: 'New Quote Submitted',
        p_message: `${quoteData.supplier.supplier_name} has submitted a quote for "${quoteData.quote_request.title}"`,
        p_user_id: quoteData.quote_request.requested_by
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't throw here as the main operation was successful
    }
  }
}
