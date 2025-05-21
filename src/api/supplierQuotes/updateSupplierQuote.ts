
import { supabaseCustom } from "@/integrations/supabase/client-custom";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { supplierQuoteStatusUpdate } from "./supplierQuoteStatusUpdate";

export async function updateSupplierQuote(
  id: string,
  updates: Partial<SupplierQuoteFormValues>,
  userId: string,
  previousData?: any
) {
  try {
    // Extract the fields that should be updated in the supplier_quotes table
    const {
      reference,
      currency,
      terms,
      remarks,
      notes,
      lead_time,
      moq,
      valid_from,
      valid_to,
      packaging_carton_quantity,
      packaging_carton_weight,
      packaging_carton_length,
      packaging_carton_width,
      packaging_carton_height,
      packaging_carton_volume,
      packaging_cartons_per_pallet,
      packaging_copies_per_20ft_palletized,
      packaging_copies_per_20ft_unpalletized,
      packaging_copies_per_40ft_palletized,
      packaging_copies_per_40ft_unpalletized,
      production_schedule,
    } = updates;

    // Update supplier quote
    const { data, error } = await supabaseCustom
      .from("supplier_quotes")
      .update({
        reference,
        currency,
        terms,
        remarks,
        notes,
        lead_time,
        moq,
        valid_from,
        valid_to,
        packaging_carton_quantity,
        packaging_carton_weight,
        packaging_carton_length,
        packaging_carton_width,
        packaging_carton_height,
        packaging_carton_volume,
        packaging_cartons_per_pallet,
        packaging_copies_per_20ft_palletized,
        packaging_copies_per_20ft_unpalletized,
        packaging_copies_per_40ft_palletized,
        packaging_copies_per_40ft_unpalletized,
        production_schedule,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating supplier quote:", error);
      throw error;
    }

    // Log the update in the audit table
    await supplierQuoteStatusUpdate(id, "updated", userId);

    return data;
  } catch (error) {
    console.error("Failed to update supplier quote:", error);
    throw error;
  }
}
