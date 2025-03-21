
import { supabase } from "@/integrations/supabase/client";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";

export async function acceptSupplierQuote(
  id: string,
  acceptedCost: number,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("supplier_quotes")
    .update({
      status: "accepted",
      total_cost: acceptedCost,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Error accepting supplier quote: ${error.message}`);
  }

  // Record audit entry
  await recordSupplierQuoteAudit(
    id,
    userId,
    "accept",
    {
      new: { status: "accepted", acceptedCost }
    }
  );
}

export async function declineSupplierQuote(
  id: string,
  userId: string,
  reason?: string
): Promise<void> {
  const { error } = await supabase
    .from("supplier_quotes")
    .update({
      status: "declined",
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Error declining supplier quote: ${error.message}`);
  }

  // Record audit entry
  await recordSupplierQuoteAudit(
    id,
    userId,
    "decline",
    {
      new: { status: "declined", reason: reason || "Quote declined" }
    }
  );
}
