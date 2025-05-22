
import { supabase } from "@/integrations/supabase/client";

/**
 * Reject a supplier quote
 * @param id - ID of the supplier quote to reject
 * @param reason - Reason for rejection
 * @returns The ID of the rejected quote
 */
export async function rejectSupplierQuote(id: string, reason: string): Promise<string> {
  try {
    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error("User not authenticated");
    }

    // Update the quote status
    const { data, error } = await supabase
      .from("supplier_quotes")
      .update({
        status: "rejected",
        rejected_at: new Date().toISOString(),
        rejected_by: userData.user.id,
        rejection_reason: reason
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Create audit record for the rejection
    await createRejectionAuditEntry(id, userData.user.id, reason);

    return id;
  } catch (error) {
    console.error("Error rejecting supplier quote:", error);
    throw new Error("Failed to reject supplier quote");
  }
}

/**
 * Create an audit entry for the quote rejection
 */
async function createRejectionAuditEntry(quoteId: string, userId: string, reason: string) {
  try {
    await supabase.from("supplier_quote_audit").insert({
      supplier_quote_id: quoteId,
      changed_by: userId,
      action: "rejected",
      changes: {
        status: "rejected",
        rejected_by: userId,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason
      }
    });
  } catch (error) {
    // Log but don't fail the main operation
    console.error("Error creating audit entry:", error);
  }
}
