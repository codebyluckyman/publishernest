
import { supabase } from "@/integrations/supabase/client";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";

export async function approveSupplierQuote(
  id: string,
  approvedCost: number,
  userId: string
): Promise<void> {
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
}
