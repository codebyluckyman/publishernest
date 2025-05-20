import { supabase } from "@/integrations/supabase/client";
import {
  SupplierQuoteFormValues,
  SupplierQuotePriceBreak,
} from "@/types/supplierQuote";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";

export async function insertSupplierQuoteExtraCostPriceBreaks(
  supplierQuoteId: string,
  extraCosts: any[]
): Promise<void> {
  // 1. Filter by unit_of_measure_id
  const eligibleExtraCosts = extraCosts.filter(
    (ec) => ec.unit_of_measure_id === "d53da411-5061-4710-aa1d-75a638c45dc6"
  );

  if (eligibleExtraCosts.length === 0) {
    console.log("No eligible extra costs found");
    return;
  }

  // Use Promise.all to handle multiple insertions
  const insertPromises = [];

  for (const extraCost of eligibleExtraCosts) {
    // 2. Handle simple unit_cost case
    if (extraCost.unit_cost !== null && extraCost.unit_cost !== undefined) {
      const recordToInsert = {
        supplier_quote_id: supplierQuoteId,
        extra_cost_id: extraCost.extra_cost_id,
        unit_cost: extraCost.unit_cost,
        unit_cost_1: null,
        unit_cost_2: null,
        unit_cost_3: null,
        unit_cost_4: null,
        unit_cost_5: null,
        unit_cost_6: null,
        unit_cost_7: null,
        unit_cost_8: null,
        unit_cost_9: null,
        unit_cost_10: null,
        unit_of_measure_id: extraCost.unit_of_measure_id,
      };
      
      insertPromises.push(
        supabase
          .from("supplier_quote_extra_cost_price_breaks")
          .insert(recordToInsert)
      );
      continue;
    }

    // 3. Handle array cases - Fix for TypeScript error by properly handling arrays
    const quantityArr = [2000, 2500, 3000, 5000, 7500, 10000, 15000, 20000, 25000];
    
    // Process each possible unit_cost_X field (1-10)
    for (let i = 1; i <= 10; i++) {
      const fieldName = `unit_cost_${i}`;
      const values = extraCost[fieldName];
      
      // Skip if no values for this field
      if (!values || (Array.isArray(values) && values.length === 0)) {
        continue;
      }
      
      // Handle array values - create a separate record for each value
      if (Array.isArray(values)) {
        values.forEach((value, index) => {
          if (value !== null && value !== undefined) {
            const newRow: Record<string, any> = {
              supplier_quote_id: supplierQuoteId,
              extra_cost_id: extraCost.extra_cost_id,
              unit_of_measure_id: extraCost.unit_of_measure_id,
              quantity: quantityArr[index] || null,
              unit_cost: null,
              unit_cost_1: null,
              unit_cost_2: null,
              unit_cost_3: null,
              unit_cost_4: null,
              unit_cost_5: null,
              unit_cost_6: null,
              unit_cost_7: null,
              unit_cost_8: null,
              unit_cost_9: null,
              unit_cost_10: null,
            };
            
            // Set only the relevant field
            newRow[fieldName] = value;
            
            insertPromises.push(
              supabase
                .from("supplier_quote_extra_cost_price_breaks")
                .insert(newRow)
            );
          }
        });
      } 
      // Handle single value
      else if (values !== null && values !== undefined) {
        const newRow: Record<string, any> = {
          supplier_quote_id: supplierQuoteId,
          extra_cost_id: extraCost.extra_cost_id,
          unit_of_measure_id: extraCost.unit_of_measure_id,
          quantity: null,
          unit_cost: null,
          unit_cost_1: null,
          unit_cost_2: null,
          unit_cost_3: null,
          unit_cost_4: null,
          unit_cost_5: null,
          unit_cost_6: null,
          unit_cost_7: null,
          unit_cost_8: null,
          unit_cost_9: null,
          unit_cost_10: null,
        };
        
        // Set only the relevant field
        newRow[fieldName] = values;
        
        insertPromises.push(
          supabase
            .from("supplier_quote_extra_cost_price_breaks")
            .insert(newRow)
        );
      }
    }
  }

  // Execute all insertions in parallel
  if (insertPromises.length > 0) {
    try {
      await Promise.all(insertPromises);
    } catch (error) {
      console.error("Error inserting extra cost price breaks:", error);
      throw error;
    }
  }
}

export async function createSupplierQuote(
  formData: SupplierQuoteFormValues,
  organizationId: string,
  userId: string
): Promise<string> {
  // Log the entire form data for debugging
  console.log(
    "Full Supplier Quote Form Data:",
    JSON.stringify(formData, null, 2)
  );

  // Remove the early return that was preventing execution
  // return;

  // Log extra costs with improved structure to show we're removing price breaks
  if (formData.extra_costs && formData.extra_costs.length > 0) {
    formData.extra_costs.forEach((ec, index) => {
      // Log the main extra cost object
      console.log(`Extra cost #${index + 1} (${ec.extra_cost_id}):`);
      console.log("  Base properties:", {
        extra_cost_id: ec.extra_cost_id,
        unit_cost: ec.unit_cost,
        unit_of_measure_id: ec.unit_of_measure_id,
      });

      // Log unit costs
      const unitCostEntries = Object.entries(ec).filter(
        ([key, value]) =>
          key.startsWith("unit_cost_") &&
          !isNaN(parseInt(key.replace("unit_cost_", ""))) &&
          value !== undefined &&
          value !== null
      );

      if (unitCostEntries.length > 0) {
        console.log("  Unit costs:");
        unitCostEntries.forEach(([key, value]) => {
          console.log(`    ${key}: ${value}`);
        });
      }

      // Check if there are any numeric indices that might contain unit costs
      const numericIndices = Object.keys(ec).filter(
        (key) => !isNaN(parseInt(key))
      );
      if (numericIndices.length > 0) {
        console.log("  Indexed unit costs:");
        numericIndices.forEach((idx) => {
          const unitCostObj = ec[idx as keyof typeof ec];
          if (typeof unitCostObj === "object" && unitCostObj !== null) {
            console.log(`    Index ${idx}:`, unitCostObj);
          }
        });
      }
    });
  }

  // Insert the supplier quote record
  const { data: supplierQuote, error } = await supabase
    .from("supplier_quotes")
    .insert({
      organization_id: organizationId,
      quote_request_id: formData.quote_request_id,
      supplier_id: formData.supplier_id,
      currency: formData.currency || "USD", // Default to USD if currency is not provided
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
      packaging_cartons_per_pallet:
        formData.packaging_cartons_per_pallet || null,
      packaging_copies_per_20ft_palletized:
        formData.packaging_copies_per_20ft_palletized || null,
      packaging_copies_per_40ft_palletized:
        formData.packaging_copies_per_40ft_palletized || null,
      packaging_copies_per_20ft_unpalletized:
        formData.packaging_copies_per_20ft_unpalletized || null,
      packaging_copies_per_40ft_unpalletized:
        formData.packaging_copies_per_40ft_unpalletized || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating supplier quote: ${error.message}`);
  }

  // Fetch quote request formats to get format IDs
  const { data: quoteRequestFormats, error: quoteRequestFormatsError } =
    await supabase
      .from("quote_request_formats")
      .select("id, format_id")
      .eq("quote_request_id", formData.quote_request_id);

  if (quoteRequestFormatsError) {
    console.error(
      "Error fetching quote request formats:",
      quoteRequestFormatsError.message
    );
    // Continue execution - we don't want to fail the entire operation if this fails
  } else {
    // Extract unique format associations
    const formatAssociations = new Map();

    // First, add all format associations from the quote request formats
    if (quoteRequestFormats && quoteRequestFormats.length > 0) {
      quoteRequestFormats.forEach((qrf) => {
        if (qrf.format_id && qrf.id) {
          formatAssociations.set(qrf.id, {
            supplier_quote_id: supplierQuote.id,
            format_id: qrf.format_id,
            quote_request_format_id: qrf.id,
          });
        }
      });
    }

    // Then, check if we have price breaks that reference specific formats
    if (formData.price_breaks && formData.price_breaks.length > 0) {
      formData.price_breaks.forEach((pb) => {
        if (pb.quote_request_format_id) {
          const qrf = quoteRequestFormats?.find(
            (f) => f.id === pb.quote_request_format_id
          );
          if (qrf && qrf.format_id) {
            formatAssociations.set(pb.quote_request_format_id, {
              supplier_quote_id: supplierQuote.id,
              format_id: qrf.format_id,
              quote_request_format_id: pb.quote_request_format_id,
            });
          }
        }
      });
    }

    // Insert format associations if we found any
    if (formatAssociations.size > 0) {
      const formatsToInsert = Array.from(formatAssociations.values());
      const { error: formatInsertError } = await supabase
        .from("supplier_quote_formats")
        .insert(formatsToInsert);

      if (formatInsertError) {
        console.error(
          "Error inserting format associations:",
          formatInsertError
        );
      } else {
        console.log("Successfully inserted format associations");
      }
    }
  }

  // Insert price breaks if any
  if (formData.price_breaks && formData.price_breaks.length > 0) {
    // Create a map to store format IDs for each quote_request_format_id
    const formatIdMap = new Map();
    if (quoteRequestFormats && quoteRequestFormats.length > 0) {
      quoteRequestFormats.forEach((qrf) => {
        formatIdMap.set(qrf.id, qrf.format_id);
      });
    }

    const priceBreaksToInsert = formData.price_breaks.map((pb) => {
      // Get format_id from our map based on the quote_request_format_id
      const format_id = formatIdMap.get(pb.quote_request_format_id);

      return {
        supplier_quote_id: supplierQuote.id,
        quote_request_format_id: pb.quote_request_format_id,
        price_break_id: pb.price_break_id,
        product_id: pb.product_id || null,
        format_id: format_id || null, // Include the format_id from our mapping
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
      };
    });

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
    const standardExtraCosts = formData.extra_costs.filter(
      (ec) => ec.unit_of_measure_id !== "d53da411-5061-4710-aa1d-75a638c45dc6"
    );

    const priceBreakExtraCosts = formData.extra_costs.filter(
      (ec) => ec.unit_of_measure_id === "d53da411-5061-4710-aa1d-75a638c45dc6"
    );

    const standardCostsToInsert = standardExtraCosts
      .filter((ec) => {
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

        return hasValue;
      })
      .map((ec) => ({
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
        unit_of_measure_id: ec.unit_of_measure_id,
      }));

    const priceBreakCostsToInsert = priceBreakExtraCosts
      .filter((ec) => {
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

        return hasValue;
      })
      .map((ec) => ({
        supplier_quote_id: supplierQuote.id,
        extra_cost_id: ec.extra_cost_id ? ec.extra_cost_id : null,
        unit_cost: null,
        unit_cost_1: null,
        unit_cost_2: null,
        unit_cost_3: null,
        unit_cost_4: null,
        unit_cost_5: null,
        unit_cost_6: null,
        unit_cost_7: null,
        unit_cost_8: null,
        unit_cost_9: null,
        unit_cost_10: null,
        unit_of_measure_id: ec.unit_of_measure_id,
      }));

    if (standardCostsToInsert.length > 0) {
      const { error: extraCostsError } = await supabase
        .from("supplier_quote_extra_costs")
        .insert(standardCostsToInsert);

      if (extraCostsError) {
        console.error("Error inserting standard extra costs:", extraCostsError);
      }
    }

    if (priceBreakCostsToInsert.length > 0) {
      const { error: priceBreakError } = await supabase
        .from("supplier_quote_extra_costs")
        .insert(priceBreakCostsToInsert);

      if (priceBreakError) {
        console.error(
          "Error inserting price break extra costs:",
          priceBreakError
        );
      }
    }

    // NEW FUNCTIONALITY: Insert extra cost price breaks for unit_of_measure_id = "d53da411-5061-4710-aa1d-75a638c45dc6"
    await insertSupplierQuoteExtraCostPriceBreaks(
      supplierQuote.id,
      priceBreakExtraCosts
    );
  }

  // Insert savings if any
  if (formData.savings && formData.savings.length > 0) {
    const savingsToInsert = formData.savings
      .filter((s) => {
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

        return hasValue;
      })
      .map((s) => ({
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
        unit_of_measure_id: s.unit_of_measure_id,
      }));

    if (savingsToInsert.length > 0) {
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
  await recordSupplierQuoteAudit(supplierQuote.id, userId, "create", {
    new: formData,
  });

  return supplierQuote.id;
}
