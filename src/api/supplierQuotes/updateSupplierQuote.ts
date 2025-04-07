
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";

export async function updateSupplierQuote(
  id: string,
  updates: Partial<SupplierQuoteFormValues>,
  userId: string,
  previousData?: any
): Promise<void> {
  try {
    // Update the main quote record
    const quoteUpdateData = {
      reference: updates.reference,
      notes: updates.notes,
      currency: updates.currency,
      valid_from: updates.valid_from,
      valid_to: updates.valid_to,
      terms: updates.terms,
      remarks: updates.remarks,
      production_schedule: updates.production_schedule,
      
      // Packaging details
      packaging_carton_quantity: updates.packaging_carton_quantity,
      packaging_carton_weight: updates.packaging_carton_weight,
      packaging_carton_length: updates.packaging_carton_length,
      packaging_carton_width: updates.packaging_carton_width,
      packaging_carton_height: updates.packaging_carton_height,
      packaging_carton_volume: updates.packaging_carton_volume,
      packaging_cartons_per_pallet: updates.packaging_cartons_per_pallet,
      packaging_copies_per_20ft_palletized: updates.packaging_copies_per_20ft_palletized,
      packaging_copies_per_40ft_palletized: updates.packaging_copies_per_40ft_palletized,
      packaging_copies_per_20ft_unpalletized: updates.packaging_copies_per_20ft_unpalletized,
      packaging_copies_per_40ft_unpalletized: updates.packaging_copies_per_40ft_unpalletized,
      
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from("supplier_quotes")
      .update(quoteUpdateData)
      .eq("id", id);

    if (updateError) {
      throw new Error(`Error updating supplier quote: ${updateError.message}`);
    }

    // Record an audit entry for the update
    await recordSupplierQuoteAudit({
      supplier_quote_id: id,
      user_id: userId,
      action: "update",
      details: {
        previous: previousData,
        updated: updates
      }
    });

    // Update price breaks if provided
    if (updates.price_breaks && updates.price_breaks.length > 0) {
      // Delete existing price breaks
      const { error: deleteError } = await supabase
        .from("supplier_quote_price_breaks")
        .delete()
        .eq("supplier_quote_id", id);

      if (deleteError) {
        throw new Error(`Error deleting existing price breaks: ${deleteError.message}`);
      }

      // Insert new price breaks
      const priceBreakData = updates.price_breaks.map(pb => ({
        supplier_quote_id: id,
        quote_request_format_id: pb.quote_request_format_id,
        price_break_id: pb.price_break_id,
        product_id: pb.product_id,
        quantity: pb.quantity,
        unit_cost: pb.unit_cost,
        unit_cost_1: pb.unit_cost_1,
        unit_cost_2: pb.unit_cost_2,
        unit_cost_3: pb.unit_cost_3,
        unit_cost_4: pb.unit_cost_4,
        unit_cost_5: pb.unit_cost_5,
        unit_cost_6: pb.unit_cost_6,
        unit_cost_7: pb.unit_cost_7,
        unit_cost_8: pb.unit_cost_8,
        unit_cost_9: pb.unit_cost_9,
        unit_cost_10: pb.unit_cost_10,
      }));

      if (priceBreakData.length > 0) {
        const { error: insertError } = await supabase
          .from("supplier_quote_price_breaks")
          .insert(priceBreakData);

        if (insertError) {
          throw new Error(`Error inserting updated price breaks: ${insertError.message}`);
        }
      }
    }

    // Update extra costs if provided
    if (updates.extra_costs && updates.extra_costs.length > 0) {
      // Delete existing extra costs
      const { error: deleteError } = await supabase
        .from("supplier_quote_extra_costs")
        .delete()
        .eq("supplier_quote_id", id);

      if (deleteError) {
        throw new Error(`Error deleting existing extra costs: ${deleteError.message}`);
      }

      // Insert new extra costs
      const extraCostData = updates.extra_costs.map(ec => ({
        supplier_quote_id: id,
        extra_cost_id: ec.extra_cost_id,
        unit_cost: ec.unit_cost,
        unit_cost_1: ec.unit_cost_1,
        unit_cost_2: ec.unit_cost_2,
        unit_cost_3: ec.unit_cost_3,
        unit_cost_4: ec.unit_cost_4,
        unit_cost_5: ec.unit_cost_5,
        unit_cost_6: ec.unit_cost_6,
        unit_cost_7: ec.unit_cost_7,
        unit_cost_8: ec.unit_cost_8,
        unit_cost_9: ec.unit_cost_9,
        unit_cost_10: ec.unit_cost_10,
        unit_of_measure_id: ec.unit_of_measure_id
      }));

      if (extraCostData.length > 0) {
        const { error: insertError } = await supabase
          .from("supplier_quote_extra_costs")
          .insert(extraCostData);

        if (insertError) {
          throw new Error(`Error inserting updated extra costs: ${insertError.message}`);
        }
      }
    }

    // Update savings if provided
    if (updates.savings && updates.savings.length > 0) {
      // Delete existing savings
      const { error: deleteError } = await supabase
        .from("supplier_quote_savings")
        .delete()
        .eq("supplier_quote_id", id);

      if (deleteError) {
        throw new Error(`Error deleting existing savings: ${deleteError.message}`);
      }

      // Insert new savings
      const savingsData = updates.savings.map(saving => ({
        supplier_quote_id: id,
        saving_id: saving.saving_id,
        price_break_id: saving.price_break_id,
        unit_cost: saving.unit_cost,
        unit_cost_1: saving.unit_cost_1,
        unit_cost_2: saving.unit_cost_2,
        unit_cost_3: saving.unit_cost_3,
        unit_cost_4: saving.unit_cost_4,
        unit_cost_5: saving.unit_cost_5,
        unit_cost_6: saving.unit_cost_6,
        unit_cost_7: saving.unit_cost_7,
        unit_cost_8: saving.unit_cost_8,
        unit_cost_9: saving.unit_cost_9,
        unit_cost_10: saving.unit_cost_10,
        unit_of_measure_id: saving.unit_of_measure_id
      }));

      if (savingsData.length > 0) {
        const { error: insertError } = await supabase
          .from("supplier_quote_savings")
          .insert(savingsData);

        if (insertError) {
          throw new Error(`Error inserting updated savings: ${insertError.message}`);
        }
      }
    }
  } catch (error: any) {
    console.error("Error in updateSupplierQuote:", error);
    throw new Error(error.message || "An error occurred while updating the supplier quote");
  }
}
