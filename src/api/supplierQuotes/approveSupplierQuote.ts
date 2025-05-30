
import { supabase } from "@/integrations/supabase/client";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";
import { sendSupplierQuoteApprovalNotifications } from "./sendSupplierQuoteApprovalNotifications";

export async function approveSupplierQuote(
  id: string,
  approvedCost: number,
  userId: string
): Promise<void> {
  // Get the current quote data before updating
  const { data: currentQuote, error: fetchError } = await supabase
    .from("supplier_quotes")
    .select("organization_id, status")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching supplier quote: ${fetchError.message}`);
  }

  const { error } = await supabase
    .from("supplier_quotes")
    .update({
      status: "approved",
      total_cost: approvedCost,
      approved_at: new Date().toISOString(),
      approved_by: userId,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Error approving supplier quote: ${error.message}`);
  }

  // Record audit entry
  await recordSupplierQuoteAudit(
    id,
    userId,
    "approve",
    {
      new: { status: "approved", approvedCost, approved_by: userId, approved_at: new Date().toISOString() }
    }
  );

  // Send approval notifications to supplier users if status changed from non-approved to approved
  if (currentQuote.status !== "approved") {
    console.log("Supplier quote approved, sending notifications to supplier users");
    
    try {
      // Fire and forget - don't block the approval if notifications fail
      sendSupplierQuoteApprovalNotifications(id, currentQuote.organization_id, approvedCost)
        .catch(error => {
          console.error("Failed to send supplier quote approval notifications:", error);
        });
    } catch (notificationError) {
      console.error("Error starting supplier quote approval notifications:", notificationError);
    }
  }
}
