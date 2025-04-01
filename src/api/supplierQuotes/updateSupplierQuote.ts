
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
    const priceBreaksToInsert = updates.price_breaks.map(pb => {
      // Create a base object with the required fields
      const priceBreakData: Record<string, any> = {
        supplier_quote_id: id,
        quote_request_format_id: pb.quote_request_format_id,
        price_break_id: pb.price_break_id,
        quantity: pb.quantity,
        product_id: pb.product_id || null,
      };
      
      // Add unit costs based on what's provided in the form
      // Regular unit_cost field (for single product case)
      if (pb.unit_cost !== undefined) {
        priceBreakData.unit_cost = pb.unit_cost;
      }
      
      // Add individual unit cost fields for multiple products if they exist
      for (let i = 1; i <= 10; i++) {
        const unitCostKey = `unit_cost_${i}` as keyof typeof pb;
        if (pb[unitCostKey] !== undefined) {
          priceBreakData[unitCostKey] = pb[unitCostKey];
        }
      }
      
      return priceBreakData;
    });

    const { error: insertError } = await supabase
      .from("supplier_quote_price_breaks")
      .insert(priceBreaksToInsert);

    if (insertError) {
      throw new Error(`Error inserting updated price breaks: ${insertError.message}`);
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
