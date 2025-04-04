import { supabase } from "@/integrations/supabase/client";
import { SupplierQuoteFormValues, SupplierQuotePriceBreak, SupplierQuoteExtraCost } from "@/types/supplierQuote";
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

  // Update price breaks if provided
  if (updates.price_breaks) {
    // First, get existing price breaks
    const { data: existingPriceBreaks, error: fetchError } = await supabase
      .from("supplier_quote_price_breaks")
      .select("*")
      .eq("supplier_quote_id", id);

    if (fetchError) {
      console.error("Error fetching existing price breaks:", fetchError);
    } else {
      // Create a map of existing price breaks for quick lookup
      const existingPriceBreaksMap = new Map<string, any>();
      
      if (existingPriceBreaks) {
        existingPriceBreaks.forEach(pb => {
          const key = `${pb.quote_request_format_id}_${pb.price_break_id}`;
          existingPriceBreaksMap.set(key, pb);
        });
      }

      // Process each price break from the update
      for (const priceBreak of updates.price_breaks) {
        const key = `${priceBreak.quote_request_format_id}_${priceBreak.price_break_id}`;
        const existingPriceBreak = existingPriceBreaksMap.get(key);

        if (existingPriceBreak) {
          // Update existing price break
          const { error: updateError } = await supabase
            .from("supplier_quote_price_breaks")
            .update({
              unit_cost: priceBreak.unit_cost === undefined ? null : priceBreak.unit_cost,
              unit_cost_1: priceBreak.unit_cost_1 === undefined ? null : priceBreak.unit_cost_1,
              unit_cost_2: priceBreak.unit_cost_2 === undefined ? null : priceBreak.unit_cost_2,
              unit_cost_3: priceBreak.unit_cost_3 === undefined ? null : priceBreak.unit_cost_3,
              unit_cost_4: priceBreak.unit_cost_4 === undefined ? null : priceBreak.unit_cost_4,
              unit_cost_5: priceBreak.unit_cost_5 === undefined ? null : priceBreak.unit_cost_5,
              unit_cost_6: priceBreak.unit_cost_6 === undefined ? null : priceBreak.unit_cost_6,
              unit_cost_7: priceBreak.unit_cost_7 === undefined ? null : priceBreak.unit_cost_7,
              unit_cost_8: priceBreak.unit_cost_8 === undefined ? null : priceBreak.unit_cost_8,
              unit_cost_9: priceBreak.unit_cost_9 === undefined ? null : priceBreak.unit_cost_9,
              unit_cost_10: priceBreak.unit_cost_10 === undefined ? null : priceBreak.unit_cost_10
            })
            .eq("id", existingPriceBreak.id);

          if (updateError) {
            console.error(`Error updating price break ${existingPriceBreak.id}:`, updateError);
          }
        } else {
          // Insert new price break
          const { error: insertError } = await supabase
            .from("supplier_quote_price_breaks")
            .insert({
              supplier_quote_id: id,
              quote_request_format_id: priceBreak.quote_request_format_id,
              price_break_id: priceBreak.price_break_id,
              quantity: priceBreak.quantity,
              unit_cost: priceBreak.unit_cost === undefined ? null : priceBreak.unit_cost,
              unit_cost_1: priceBreak.unit_cost_1 === undefined ? null : priceBreak.unit_cost_1,
              unit_cost_2: priceBreak.unit_cost_2 === undefined ? null : priceBreak.unit_cost_2,
              unit_cost_3: priceBreak.unit_cost_3 === undefined ? null : priceBreak.unit_cost_3,
              unit_cost_4: priceBreak.unit_cost_4 === undefined ? null : priceBreak.unit_cost_4,
              unit_cost_5: priceBreak.unit_cost_5 === undefined ? null : priceBreak.unit_cost_5,
              unit_cost_6: priceBreak.unit_cost_6 === undefined ? null : priceBreak.unit_cost_6,
              unit_cost_7: priceBreak.unit_cost_7 === undefined ? null : priceBreak.unit_cost_7,
              unit_cost_8: priceBreak.unit_cost_8 === undefined ? null : priceBreak.unit_cost_8,
              unit_cost_9: priceBreak.unit_cost_9 === undefined ? null : priceBreak.unit_cost_9,
              unit_cost_10: priceBreak.unit_cost_10 === undefined ? null : priceBreak.unit_cost_10
            });

          if (insertError) {
            console.error("Error inserting price break:", insertError);
          }
        }
      }
    }
  }

  // Update extra costs if provided
  if (updates.extra_costs && updates.extra_costs.length > 0) {
    // First, get existing extra costs
    const { data: existingExtraCosts, error: fetchExtraCostsError } = await supabase
      .from("supplier_quote_extra_costs")
      .select("*")
      .eq("supplier_quote_id", id);

    if (fetchExtraCostsError) {
      console.error("Error fetching existing extra costs:", fetchExtraCostsError);
    } else {
      // Create a map of existing extra costs for quick lookup
      const existingExtraCostsMap = new Map<string, SupplierQuoteExtraCost>();
      
      if (existingExtraCosts) {
        existingExtraCosts.forEach(ec => {
          // Cast to SupplierQuoteExtraCost to ensure consistency
          const extraCost = ec as unknown as SupplierQuoteExtraCost;
          // Create a key using just the extra_cost_id
          const key = extraCost.extra_cost_id;
          existingExtraCostsMap.set(key, extraCost);
        });
      }

      // Process each extra cost from the update
      for (const extraCost of updates.extra_costs) {
        // Skip costs with no values
        const hasValue = 
               (extraCost.unit_cost !== null && extraCost.unit_cost !== undefined) || 
               (extraCost.unit_cost_1 !== null && extraCost.unit_cost_1 !== undefined) || 
               (extraCost.unit_cost_2 !== null && extraCost.unit_cost_2 !== undefined) ||
               (extraCost.unit_cost_3 !== null && extraCost.unit_cost_3 !== undefined) ||
               (extraCost.unit_cost_4 !== null && extraCost.unit_cost_4 !== undefined) ||
               (extraCost.unit_cost_5 !== null && extraCost.unit_cost_5 !== undefined) ||
               (extraCost.unit_cost_6 !== null && extraCost.unit_cost_6 !== undefined) ||
               (extraCost.unit_cost_7 !== null && extraCost.unit_cost_7 !== undefined) ||
               (extraCost.unit_cost_8 !== null && extraCost.unit_cost_8 !== undefined) ||
               (extraCost.unit_cost_9 !== null && extraCost.unit_cost_9 !== undefined) ||
               (extraCost.unit_cost_10 !== null && extraCost.unit_cost_10 !== undefined);
               
        if (!hasValue) continue;

        // Create a key using just the extra_cost_id
        const key = extraCost.extra_cost_id;
        const existingExtraCost = existingExtraCostsMap.get(key);

        if (existingExtraCost) {
          // Update existing extra cost
          const { error: updateError } = await supabase
            .from("supplier_quote_extra_costs")
            .update({
              unit_cost: extraCost.unit_cost === undefined ? null : extraCost.unit_cost,
              unit_cost_1: extraCost.unit_cost_1 === undefined ? null : extraCost.unit_cost_1,
              unit_cost_2: extraCost.unit_cost_2 === undefined ? null : extraCost.unit_cost_2,
              unit_cost_3: extraCost.unit_cost_3 === undefined ? null : extraCost.unit_cost_3,
              unit_cost_4: extraCost.unit_cost_4 === undefined ? null : extraCost.unit_cost_4,
              unit_cost_5: extraCost.unit_cost_5 === undefined ? null : extraCost.unit_cost_5,
              unit_cost_6: extraCost.unit_cost_6 === undefined ? null : extraCost.unit_cost_6,
              unit_cost_7: extraCost.unit_cost_7 === undefined ? null : extraCost.unit_cost_7,
              unit_cost_8: extraCost.unit_cost_8 === undefined ? null : extraCost.unit_cost_8,
              unit_cost_9: extraCost.unit_cost_9 === undefined ? null : extraCost.unit_cost_9,
              unit_cost_10: extraCost.unit_cost_10 === undefined ? null : extraCost.unit_cost_10,
              unit_of_measure_id: extraCost.unit_of_measure_id
            })
            .eq("id", existingExtraCost.id);

          if (updateError) {
            console.error(`Error updating extra cost ${existingExtraCost.id}:`, updateError);
          }
        } else {
          // Insert new extra cost
          const { error: insertError } = await supabase
            .from("supplier_quote_extra_costs")
            .insert({
              supplier_quote_id: id,
              extra_cost_id: extraCost.extra_cost_id,
              unit_cost: extraCost.unit_cost === undefined ? null : extraCost.unit_cost,
              unit_cost_1: extraCost.unit_cost_1 === undefined ? null : extraCost.unit_cost_1,
              unit_cost_2: extraCost.unit_cost_2 === undefined ? null : extraCost.unit_cost_2,
              unit_cost_3: extraCost.unit_cost_3 === undefined ? null : extraCost.unit_cost_3,
              unit_cost_4: extraCost.unit_cost_4 === undefined ? null : extraCost.unit_cost_4,
              unit_cost_5: extraCost.unit_cost_5 === undefined ? null : extraCost.unit_cost_5,
              unit_cost_6: extraCost.unit_cost_6 === undefined ? null : extraCost.unit_cost_6,
              unit_cost_7: extraCost.unit_cost_7 === undefined ? null : extraCost.unit_cost_7,
              unit_cost_8: extraCost.unit_cost_8 === undefined ? null : extraCost.unit_cost_8,
              unit_cost_9: extraCost.unit_cost_9 === undefined ? null : extraCost.unit_cost_9,
              unit_cost_10: extraCost.unit_cost_10 === undefined ? null : extraCost.unit_cost_10,
              unit_of_measure_id: extraCost.unit_of_measure_id
            });

          if (insertError) {
            console.error("Error inserting extra cost:", insertError);
          }
        }
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
