
import { supabase } from "@/integrations/supabase/client";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";

export async function submitSupplierQuote(
  id: string,
  totalCost: number,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("supplier_quotes")
    .update({
      status: "submitted",
      total_cost: totalCost,
      submitted_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Error submitting supplier quote: ${error.message}`);
  }

  // Record audit entry
  await recordSupplierQuoteAudit(
    id,
    userId,
    "submit",
    {
      new: { status: "submitted", total_cost: totalCost }
    }
  );
}
