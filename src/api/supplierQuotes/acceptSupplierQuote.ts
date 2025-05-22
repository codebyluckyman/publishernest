
import { supabase } from "@/integrations/supabase/client";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";

/**
 * Accept a supplier quote
 * @param id - ID of the supplier quote to accept
 * @param acceptedCost - The accepted cost amount
 * @param userId - ID of the user accepting the quote
 * @returns Promise resolving to void
 */
export async function acceptSupplierQuote(
  id: string,
  acceptedCost: number,
  userId: string
): Promise<void> {
  try {
    // Update the quote status
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
  } catch (error) {
    console.error("Error accepting supplier quote:", error);
    throw error;
  }
}
