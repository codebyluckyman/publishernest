
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Approve a supplier quote
 * @param id - ID of the supplier quote to approve
 * @param approvedCost - The approved cost amount
 * @returns The ID of the approved quote
 */
export async function approveSupplierQuote(id: string, approvedCost: number): Promise<string> {
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
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: userData.user.id,
        total_cost: approvedCost
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Create audit record for the approval
    await createApprovalAuditEntry(id, userData.user.id, approvedCost);

    return id;
  } catch (error) {
    console.error("Error approving supplier quote:", error);
    throw new Error("Failed to approve supplier quote");
  }
}

/**
 * Create an audit entry for the quote approval
 */
async function createApprovalAuditEntry(quoteId: string, userId: string, approvedCost: number) {
  try {
    await supabase.from("supplier_quote_audit").insert({
      supplier_quote_id: quoteId,
      changed_by: userId,
      action: "approved",
      changes: {
        status: "approved",
        approved_by: userId,
        approved_at: new Date().toISOString(),
        total_cost: approvedCost
      }
    });
  } catch (error) {
    // Log but don't fail the main operation
    console.error("Error creating audit entry:", error);
  }
}
