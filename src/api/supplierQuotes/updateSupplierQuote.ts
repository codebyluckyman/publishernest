
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";

export async function updateSupplierQuote(
  id: string,
  updates: Partial<SupplierQuoteFormValues>,
  userId: string,
  previousData?: any
): Promise<void> {
  // Extract basic quote data to update
  const {
    notes,
    currency,
    reference,
    valid_from,
    valid_to,
    terms,
    remarks,
    production_schedule,
    packaging_carton_quantity,
    packaging_carton_weight,
    packaging_carton_length,
    packaging_carton_width,
    packaging_carton_height,
    packaging_carton_volume,
    packaging_cartons_per_pallet,
    packaging_copies_per_20ft_palletized,
    packaging_copies_per_40ft_palletized,
    packaging_copies_per_20ft_unpalletized,
    packaging_copies_per_40ft_unpalletized,
  } = updates;

  // Prepare base quote data
  const quoteData = {
    notes,
    currency,
    reference,
    valid_from,
    valid_to,
    terms,
    remarks,
    production_schedule,
    packaging_carton_quantity,
    packaging_carton_weight,
    packaging_carton_length,
    packaging_carton_width,
    packaging_carton_height,
    packaging_carton_volume,
    packaging_cartons_per_pallet,
    packaging_copies_per_20ft_palletized,
    packaging_copies_per_40ft_palletized,
    packaging_copies_per_20ft_unpalletized,
    packaging_copies_per_40ft_unpalletized,
  };

  // Update the supplier quote
  const { error } = await supabase
    .from("supplier_quotes")
    .update(quoteData)
    .eq("id", id);

  if (error) {
    throw new Error(`Error updating supplier quote: ${error.message}`);
  }

  // Record audit entry - make sure to pass all required arguments
  await recordSupplierQuoteAudit(
    id,
    userId,
    "update",
    {
      previous: previousData,
      new: updates
    }
  );
}
