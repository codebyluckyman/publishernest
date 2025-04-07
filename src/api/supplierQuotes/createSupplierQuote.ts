
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuoteFormValues, SupplierQuotePriceBreak } from "@/types/supplierQuote";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";

export async function createSupplierQuote(
  formData: SupplierQuoteFormValues,
  organizationId: string,
  userId: string
): Promise<string> {
  // Log the entire form data for debugging
  console.log('Full Supplier Quote Form Data:', JSON.stringify(formData, null, 2));

  // Log savings for debugging
  if (formData.savings && formData.savings.length > 0) {
    console.log('Savings before filtering:', formData.savings);
  }

  // Log extra costs with improved structure
  if (formData.extra_costs && formData.extra_costs.length > 0) {
    console.log('Extra costs after form initialization:');
    
    formData.extra_costs.forEach((ec, index) => {
      // Log the main extra cost object
      console.log(`Extra cost #${index + 1} (${ec.extra_cost_id}):`);
      console.log('  Base properties:', {
        extra_cost_id: ec.extra_cost_id,
        unit_cost: ec.unit_cost,
        unit_of_measure_id: ec.unit_of_measure_id
      });
      
      // Log unit costs
      const unitCostEntries = Object.entries(ec).filter(([key, value]) => 
        key.startsWith('unit_cost_') && 
        !isNaN(parseInt(key.replace('unit_cost_', ''))) &&
        value !== undefined && 
        value !== null
      );
      
      if (unitCostEntries.length > 0) {
        console.log('  Unit costs:');
        unitCostEntries.forEach(([key, value]) => {
          console.log(`    ${key}: ${value}`);
        });
      }
      
      // Check if there are any numeric indices that might contain unit costs
      const numericIndices = Object.keys(ec).filter(key => !isNaN(parseInt(key)));
      if (numericIndices.length > 0) {
        console.log('  Indexed unit costs:');
        numericIndices.forEach(idx => {
          const unitCostObj = ec[idx as keyof typeof ec];
          if (typeof unitCostObj === 'object' && unitCostObj !== null) {
            console.log(`    Index ${idx}:`, unitCostObj);
          }
        });
      }
      
      console.log('---------------------');
    });
  }

  // Insert the supplier quote record
  const { data: supplierQuote, error } = await supabase
    .from("supplier_quotes")
    .insert({
      organization_id: organizationId,
      quote_request_id: formData.quote_request_id,
      supplier_id: formData.supplier_id,
      currency: formData.currency || 'USD',  // Default to USD if currency is not provided
      notes: formData.notes || null,
      status: "draft",
      reference: formData.reference || null,
      // Additional fields
      valid_from: formData.valid_from || null,
      valid_to: formData.valid_to || null,
      terms: formData.terms || null,
      remarks: formData.remarks || null,
      production_schedule: formData.production_schedule || null,
      // Packaging details
      packaging_carton_quantity: formData.packaging_carton_quantity || null,
      packaging_carton_weight: formData.packaging_carton_weight || null,
      packaging_carton_length: formData.packaging_carton_length || null,
      packaging_carton_width: formData.packaging_carton_width || null,
      packaging_carton_height: formData.packaging_carton_height || null,
      packaging_carton_volume: formData.packaging_carton_volume || null,
      packaging_cartons_per_pallet: formData.packaging_cartons_per_pallet || null,
      packaging_copies_per_20ft_palletized: formData.packaging_copies_per_20ft_palletized || null,
      packaging_copies_per_40ft_palletized: formData.packaging_copies_per_40ft_palletized || null,
      packaging_copies_per_20ft_unpalletized: formData.packaging_copies_per_20ft_unpalletized || null,
      packaging_copies_per_40ft_unpalletized: formData.packaging_copies_per_40ft_unpalletized || null
    })
    .select()
    .single();

  console.log('Inserted Supplier Quote:', supplierQuote);
  console.log('Supplier Quote ID:', supplierQuote?.id);
  console.log('Supplier Quote Insertion Error:', error);

  if (error) {
    throw new Error(`Error creating supplier quote: ${error.message}`);
  }

  // Insert price breaks if any
  if (formData.price_breaks && formData.price_breaks.length > 0) {
    const priceBreaksToInsert = formData.price_breaks.map(pb => ({
      supplier_quote_id: supplierQuote.id,
      quote_request_format_id: pb.quote_request_format_id,
      price_break_id: pb.price_break_id,
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
      unit_cost_10: pb.unit_cost_10
    }));

    const { error: priceBreaksError } = await supabase
      .from("supplier_quote_price_breaks")
      .insert(priceBreaksToInsert);

    if (priceBreaksError) {
      console.error("Error inserting price breaks:", priceBreaksError);
      // Continue execution - we don't want to fail the entire operation if price breaks fail
    }
  }

  // Insert extra costs if any
  if (formData.extra_costs && formData.extra_costs.length > 0) {
    // Log all extra costs for debugging
    console.log('Extra costs before filtering:', formData.extra_costs);
    
    const extraCostsToInsert = formData.extra_costs
      .filter(ec => {
        // Only insert costs that have any values - either unit_cost or any of unit_cost_1 through unit_cost_10
        const hasValue = 
               (ec.unit_cost !== null && ec.unit_cost !== undefined) || 
               (ec.unit_cost_1 !== null && ec.unit_cost_1 !== undefined) || 
               (ec.unit_cost_2 !== null && ec.unit_cost_2 !== undefined) ||
               (ec.unit_cost_3 !== null && ec.unit_cost_3 !== undefined) ||
               (ec.unit_cost_4 !== null && ec.unit_cost_4 !== undefined) ||
               (ec.unit_cost_5 !== null && ec.unit_cost_5 !== undefined) ||
               (ec.unit_cost_6 !== null && ec.unit_cost_6 !== undefined) ||
               (ec.unit_cost_7 !== null && ec.unit_cost_7 !== undefined) ||
               (ec.unit_cost_8 !== null && ec.unit_cost_8 !== undefined) ||
               (ec.unit_cost_9 !== null && ec.unit_cost_9 !== undefined) ||
               (ec.unit_cost_10 !== null && ec.unit_cost_10 !== undefined);
               
        // For debugging purposes, log the extra cost and whether it has values
        console.log(`Extra cost ${ec.extra_cost_id} has values: ${hasValue}`, ec);
        
        return hasValue;
      })
      .map(ec => ({
        supplier_quote_id: supplierQuote.id,
        extra_cost_id: ec.extra_cost_id,
        unit_cost: ec.unit_cost === undefined ? null : ec.unit_cost,
        unit_cost_1: ec.unit_cost_1 === undefined ? null : ec.unit_cost_1,
        unit_cost_2: ec.unit_cost_2 === undefined ? null : ec.unit_cost_2,
        unit_cost_3: ec.unit_cost_3 === undefined ? null : ec.unit_cost_3,
        unit_cost_4: ec.unit_cost_4 === undefined ? null : ec.unit_cost_4,
        unit_cost_5: ec.unit_cost_5 === undefined ? null : ec.unit_cost_5,
        unit_cost_6: ec.unit_cost_6 === undefined ? null : ec.unit_cost_6,
        unit_cost_7: ec.unit_cost_7 === undefined ? null : ec.unit_cost_7,
        unit_cost_8: ec.unit_cost_8 === undefined ? null : ec.unit_cost_8,
        unit_cost_9: ec.unit_cost_9 === undefined ? null : ec.unit_cost_9,
        unit_cost_10: ec.unit_cost_10 === undefined ? null : ec.unit_cost_10,
        unit_of_measure_id: ec.unit_of_measure_id
      }));

    if (extraCostsToInsert.length > 0) {
      console.log('Inserting extra costs:', extraCostsToInsert);
      const { error: extraCostsError } = await supabase
        .from("supplier_quote_extra_costs")
        .insert(extraCostsToInsert);

      if (extraCostsError) {
        console.error("Error inserting extra costs:", extraCostsError);
        // Continue execution - we don't want to fail the entire operation if extra costs fail
      }
    }
  }

  // Insert savings if any
  if (formData.savings && formData.savings.length > 0) {
    // Log all savings for debugging
    console.log('Savings before filtering for insert:', formData.savings);
    
    const savingsToInsert = formData.savings
      .filter(s => {
        // Only insert savings that have any values - either unit_cost or any of unit_cost_1 through unit_cost_10
        const hasValue = 
               (s.unit_cost !== null && s.unit_cost !== undefined) || 
               (s.unit_cost_1 !== null && s.unit_cost_1 !== undefined) || 
               (s.unit_cost_2 !== null && s.unit_cost_2 !== undefined) ||
               (s.unit_cost_3 !== null && s.unit_cost_3 !== undefined) ||
               (s.unit_cost_4 !== null && s.unit_cost_4 !== undefined) ||
               (s.unit_cost_5 !== null && s.unit_cost_5 !== undefined) ||
               (s.unit_cost_6 !== null && s.unit_cost_6 !== undefined) ||
               (s.unit_cost_7 !== null && s.unit_cost_7 !== undefined) ||
               (s.unit_cost_8 !== null && s.unit_cost_8 !== undefined) ||
               (s.unit_cost_9 !== null && s.unit_cost_9 !== undefined) ||
               (s.unit_cost_10 !== null && s.unit_cost_10 !== undefined);
               
        // For debugging purposes, log the saving and whether it has values
        console.log(`Saving ${s.saving_id} has values: ${hasValue}`, s);
        
        return true; // We now insert all savings even with null values for better user experience
      })
      .map(s => ({
        supplier_quote_id: supplierQuote.id,
        saving_id: s.saving_id,
        price_break_id: s.price_break_id || null,
        unit_cost: s.unit_cost === undefined ? null : s.unit_cost,
        unit_cost_1: s.unit_cost_1 === undefined ? null : s.unit_cost_1,
        unit_cost_2: s.unit_cost_2 === undefined ? null : s.unit_cost_2,
        unit_cost_3: s.unit_cost_3 === undefined ? null : s.unit_cost_3,
        unit_cost_4: s.unit_cost_4 === undefined ? null : s.unit_cost_4,
        unit_cost_5: s.unit_cost_5 === undefined ? null : s.unit_cost_5,
        unit_cost_6: s.unit_cost_6 === undefined ? null : s.unit_cost_6,
        unit_cost_7: s.unit_cost_7 === undefined ? null : s.unit_cost_7,
        unit_cost_8: s.unit_cost_8 === undefined ? null : s.unit_cost_8,
        unit_cost_9: s.unit_cost_9 === undefined ? null : s.unit_cost_9,
        unit_cost_10: s.unit_cost_10 === undefined ? null : s.unit_cost_10,
        unit_of_measure_id: s.unit_of_measure_id
      }));

    if (savingsToInsert.length > 0) {
      console.log('Inserting savings:', savingsToInsert);
      const { error: savingsError } = await supabase
        .from("supplier_quote_savings")
        .insert(savingsToInsert);

      if (savingsError) {
        console.error("Error inserting savings:", savingsError);
        // Continue execution - we don't want to fail the entire operation if savings fail
      }
    }
  }

  // Record audit entry
  await recordSupplierQuoteAudit(
    supplierQuote.id,
    userId,
    "create",
    { new: formData }
  );

  return supplierQuote.id;
}
