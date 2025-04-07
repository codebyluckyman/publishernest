
import { supabase } from "@/integrations/supabase/client";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";

export async function deleteSupplierQuote(
  id: string,
  userId: string
): Promise<void> {
  // First, get the quote data for audit purposes
  const { data: quoteData, error: fetchError } = await supabase
    .from("supplier_quotes")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching supplier quote: ${fetchError.message}`);
  }

  // Check if the quote is in draft status - only draft quotes can be deleted
  if (quoteData.status !== "draft") {
    throw new Error("Only draft quotes can be deleted");
  }

  // Delete related records first (in cascade order)
  const tables = [
    "supplier_quote_price_breaks",
    "supplier_quote_extra_costs",
    "supplier_quote_savings",
    "supplier_quote_formats",
    "supplier_quote_attachments"
  ];

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("supplier_quote_id", id);

    if (error) {
      console.error(`Error deleting related records from ${table}:`, error);
      // Continue with deletion of other tables
    }
  }

  // Now delete the supplier quote
  const { error } = await supabase
    .from("supplier_quotes")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Error deleting supplier quote: ${error.message}`);
  }

  // Record audit entry
  await recordSupplierQuoteAudit(
    id,
    userId,
    "delete",
    {
      previous: quoteData,
      new: null
    }
  );
}
