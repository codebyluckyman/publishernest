
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";

export async function updateSupplierQuote(
  id: string,
  updates: Partial<SupplierQuoteFormValues>,
  userId: string,
  previousData?: any
): Promise<void> {
  console.log('Update Supplier Quote Data:', JSON.stringify(updates, null, 2));
  
  // Update the main supplier quote record
  const quoteUpdates: any = {};
  
  if (updates.notes !== undefined) {
    quoteUpdates.notes = updates.notes;
  }
  
  if (updates.currency !== undefined) {
    quoteUpdates.currency = updates.currency;
  }

  if (updates.reference !== undefined) {
    quoteUpdates.reference = updates.reference;
  }

  // Add new fields
  if (updates.valid_from !== undefined) {
    quoteUpdates.valid_from = updates.valid_from;
  }
  
  if (updates.valid_to !== undefined) {
    quoteUpdates.valid_to = updates.valid_to;
  }
  
  if (updates.terms !== undefined) {
    quoteUpdates.terms = updates.terms;
  }
  
  if (updates.remarks !== undefined) {
    quoteUpdates.remarks = updates.remarks;
  }

  if (updates.production_schedule !== undefined) {
    quoteUpdates.production_schedule = updates.production_schedule;
  }
  
  // Packaging details
  if (updates.packaging_carton_quantity !== undefined) {
    quoteUpdates.packaging_carton_quantity = updates.packaging_carton_quantity;
  }
  
  if (updates.packaging_carton_weight !== undefined) {
    quoteUpdates.packaging_carton_weight = updates.packaging_carton_weight;
  }
  
  if (updates.packaging_carton_length !== undefined) {
    quoteUpdates.packaging_carton_length = updates.packaging_carton_length;
  }
  
  if (updates.packaging_carton_width !== undefined) {
    quoteUpdates.packaging_carton_width = updates.packaging_carton_width;
  }
  
  if (updates.packaging_carton_height !== undefined) {
    quoteUpdates.packaging_carton_height = updates.packaging_carton_height;
  }
  
  if (updates.packaging_carton_volume !== undefined) {
    quoteUpdates.packaging_carton_volume = updates.packaging_carton_volume;
  }
  
  if (updates.packaging_cartons_per_pallet !== undefined) {
    quoteUpdates.packaging_cartons_per_pallet = updates.packaging_cartons_per_pallet;
  }
  
  if (updates.packaging_copies_per_20ft_palletized !== undefined) {
    quoteUpdates.packaging_copies_per_20ft_palletized = updates.packaging_copies_per_20ft_palletized;
  }
  
  if (updates.packaging_copies_per_40ft_palletized !== undefined) {
    quoteUpdates.packaging_copies_per_40ft_palletized = updates.packaging_copies_per_40ft_palletized;
  }
  
  if (updates.packaging_copies_per_20ft_unpalletized !== undefined) {
    quoteUpdates.packaging_copies_per_20ft_unpalletized = updates.packaging_copies_per_20ft_unpalletized;
  }
  
  if (updates.packaging_copies_per_40ft_unpalletized !== undefined) {
    quoteUpdates.packaging_copies_per_40ft_unpalletized = updates.packaging_copies_per_40ft_unpalletized;
  }

  if (Object.keys(quoteUpdates).length > 0) {
    const { error } = await supabase
      .from("supplier_quotes")
      .update(quoteUpdates)
      .eq("id", id);

    if (error) {
      throw new Error(`Error updating supplier quote: ${error.message}`);
    }
  }

  // Record audit entry
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
