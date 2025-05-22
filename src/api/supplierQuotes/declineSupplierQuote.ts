
import { supabase } from "@/integrations/supabase/client";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";

/**
 * Decline a supplier quote
 * @param id - ID of the supplier quote to decline
 * @param userId - ID of the user declining the quote
 * @param reason - Optional reason for declining
 * @returns Promise resolving to void
 */
export async function declineSupplierQuote(
  id: string,
  userId: string,
  reason?: string
): Promise<void> {
  try {
    // Update the quote status
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
  } catch (error) {
    console.error("Error declining supplier quote:", error);
    throw error;
  }
}
