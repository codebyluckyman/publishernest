
import { supabase } from "@/integrations/supabase/client";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";

export async function rejectSupplierQuote(
  id: string,
  userId: string,
  reason: string
): Promise<void> {
  const { error } = await supabase
    .from("supplier_quotes")
    .update({
      status: "rejected",
      rejected_at: new Date().toISOString(),
      rejected_by: userId,
      rejection_reason: reason,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Error rejecting supplier quote: ${error.message}`);
  }

  // Record audit entry
  await recordSupplierQuoteAudit(
    id,
    userId,
    "reject",
    {
      new: { 
        status: "rejected", 
        rejected_by: userId, 
        rejected_at: new Date().toISOString(),
        rejection_reason: reason 
      }
    }
  );
}
