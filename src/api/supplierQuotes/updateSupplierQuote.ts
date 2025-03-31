
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";

export async function updateSupplierQuote(
  id: string,
  updates: Partial<SupplierQuoteFormValues>,
  userId: string,
  previousData?: any
): Promise<void> {
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

  // Update price breaks if provided
  if (updates.price_breaks && updates.price_breaks.length > 0) {
    // First delete existing price breaks for this supplier quote
    const { error: deleteError } = await supabase
      .from("supplier_quote_price_breaks")
      .delete()
      .eq("supplier_quote_id", id);

    if (deleteError) {
      throw new Error(`Error deleting existing price breaks: ${deleteError.message}`);
    }

    // Insert updated price breaks
    const priceBreaksToInsert = updates.price_breaks.map(pb => ({
      supplier_quote_id: id,
      quote_request_format_id: pb.quote_request_format_id,
      price_break_id: pb.price_break_id,
      quantity: pb.quantity,
      product_id: pb.product_id || null,
      unit_cost: pb.unit_cost,
      // All unit cost fields for multiple products (up to 10)
      unit_cost_1: pb.unit_cost_1,
      unit_cost_2: pb.unit_cost_2,
      unit_cost_3: pb.unit_cost_3,
      unit_cost_4: pb.unit_cost_4,
      unit_cost_5: pb.unit_cost_5,
      unit_cost_6: pb.unit_cost_6,
      unit_cost_7: pb.unit_cost_7,
      unit_cost_8: pb.unit_cost_8,
      unit_cost_9: pb.unit_cost_9,
      unit_cost_10: pb.unit_cost_10
    }));

    const { error: insertError } = await supabase
      .from("supplier_quote_price_breaks")
      .insert(priceBreaksToInsert);

    if (insertError) {
      throw new Error(`Error inserting updated price breaks: ${insertError.message}`);
    }
  }

  // Update extra costs if provided
  if (updates.extra_costs && updates.extra_costs.length > 0) {
    // First delete existing extra costs and their price breaks for this supplier quote
    const { error: deleteCostsError } = await supabase
      .from("supplier_quote_extra_costs")
      .delete()
      .eq("supplier_quote_id", id);

    if (deleteCostsError) {
      throw new Error(`Error deleting existing extra costs: ${deleteCostsError.message}`);
    }
    
    const { error: deleteCostsPriceBreaksError } = await supabase
      .from("supplier_quote_extra_costs_price_breaks")
      .delete()
      .eq("supplier_quote_id", id);

    if (deleteCostsPriceBreaksError) {
      throw new Error(`Error deleting existing extra costs price breaks: ${deleteCostsPriceBreaksError.message}`);
    }

    // Insert extra costs price breaks for each price break
    const extraCostsPriceBreaksToInsert: any[] = [];
    
    updates.extra_costs.forEach(ec => {
      if (ec.price_breaks && ec.price_breaks.length > 0) {
        ec.price_breaks.forEach(pb => {
          extraCostsPriceBreaksToInsert.push({
            supplier_quote_id: id,
            extra_cost_id: ec.extra_cost_id,
            price_break_id: pb.price_break_id,
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
            unit_cost_10: pb.unit_cost_10
          });
        });
      }
    });

    if (extraCostsPriceBreaksToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("supplier_quote_extra_costs_price_breaks")
        .insert(extraCostsPriceBreaksToInsert);
        
      if (insertError) {
        throw new Error(`Error inserting extra costs price breaks: ${insertError.message}`);
      }
    }
  }

  // Update savings if provided
  if (updates.savings && updates.savings.length > 0) {
    // First delete existing savings and their price breaks for this supplier quote
    const { error: deleteSavingsError } = await supabase
      .from("supplier_quote_savings")
      .delete()
      .eq("supplier_quote_id", id);

    if (deleteSavingsError) {
      throw new Error(`Error deleting existing savings: ${deleteSavingsError.message}`);
    }
    
    const { error: deleteSavingsPriceBreaksError } = await supabase
      .from("supplier_quote_savings_price_breaks")
      .delete()
      .eq("supplier_quote_id", id);

    if (deleteSavingsPriceBreaksError) {
      throw new Error(`Error deleting existing savings price breaks: ${deleteSavingsPriceBreaksError.message}`);
    }

    // Insert savings price breaks for each price break
    const savingsPriceBreaksToInsert: any[] = [];
    
    updates.savings.forEach(s => {
      // Keep track of notes for each saving
      const notes = s.notes || null;
      
      if (s.price_breaks && s.price_breaks.length > 0) {
        s.price_breaks.forEach(pb => {
          savingsPriceBreaksToInsert.push({
            supplier_quote_id: id,
            saving_id: s.saving_id,
            price_break_id: pb.price_break_id,
            unit_cost: pb.unit_cost,
            notes: notes,
            unit_cost_1: pb.unit_cost_1,
            unit_cost_2: pb.unit_cost_2,
            unit_cost_3: pb.unit_cost_3,
            unit_cost_4: pb.unit_cost_4,
            unit_cost_5: pb.unit_cost_5,
            unit_cost_6: pb.unit_cost_6,
            unit_cost_7: pb.unit_cost_7,
            unit_cost_8: pb.unit_cost_8,
            unit_cost_9: pb.unit_cost_9,
            unit_cost_10: pb.unit_cost_10
          });
        });
      }
    });

    if (savingsPriceBreaksToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("supplier_quote_savings_price_breaks")
        .insert(savingsPriceBreaksToInsert);
        
      if (insertError) {
        throw new Error(`Error inserting savings price breaks: ${insertError.message}`);
      }
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
