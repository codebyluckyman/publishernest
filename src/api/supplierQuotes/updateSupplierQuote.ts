import { supabase } from "@/integrations/supabase/client";
import {
  SupplierQuoteFormValues,
  SupplierQuotePriceBreak,
} from "@/types/supplierQuote";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";
import { insertSupplierQuoteExtraCostPriceBreaks } from "./createSupplierQuote";

async function updateSupplierQuoteExtraCostPriceBreaks(
  id: string,
  extraCosts: any[]
): Promise<void> {
  // First, delete all existing price breaks for this quote
  const { error: deleteError } = await supabase
    .from("supplier_quote_extra_cost_price_breaks")
    .delete()
    .eq("supplier_quote_id", id);

  if (deleteError) {
    console.error("Error deleting existing price breaks:", deleteError);
    throw deleteError;
  }

  // Now insert the new price breaks (same logic as create function)
  await insertSupplierQuoteExtraCostPriceBreaks(id, extraCosts);
}

export async function updateSupplierQuote(
  id: string,
  updates: Partial<SupplierQuoteFormValues>,
  userId: string,
  previousData?: any
): Promise<string> {
  // Log the entire form data for debugging
  console.log(
    "Full Supplier Quote Update Form Data:",
    JSON.stringify(updates, null, 2)
  );

  // Update the main supplier quote record
  const { data: updatedQuote, error: updateError } = await supabase
    .from("supplier_quotes")
    .update({
      supplier_id: updates.supplier_id,
      currency: updates.currency || "USD",
      notes: updates.notes || null,
      status: updates.status || "draft",
      reference: updates.reference || null,
      // Additional fields
      valid_from: updates.valid_from || null,
      valid_to: updates.valid_to || null,
      terms: updates.terms || null,
      remarks: updates.remarks || null,
      production_schedule: updates.production_schedule || null,
      // Packaging details
      packaging_carton_quantity: updates.packaging_carton_quantity || null,
      packaging_carton_weight: updates.packaging_carton_weight || null,
      packaging_carton_length: updates.packaging_carton_length || null,
      packaging_carton_width: updates.packaging_carton_width || null,
      packaging_carton_height: updates.packaging_carton_height || null,
      packaging_carton_volume: updates.packaging_carton_volume || null,
      packaging_cartons_per_pallet:
        updates.packaging_cartons_per_pallet || null,
      packaging_copies_per_20ft_palletized:
        updates.packaging_copies_per_20ft_palletized || null,
      packaging_copies_per_40ft_palletized:
        updates.packaging_copies_per_40ft_palletized || null,
      packaging_copies_per_20ft_unpalletized:
        updates.packaging_copies_per_20ft_unpalletized || null,
      packaging_copies_per_40ft_unpalletized:
        updates.packaging_copies_per_40ft_unpalletized || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", updates.id)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Error updating supplier quote: ${updateError.message}`);
  }

  // Handle format associations (delete and recreate)
  // First delete existing associations
  const { error: deleteFormatsError } = await supabase
    .from("supplier_quote_formats")
    .delete()
    .eq("supplier_quote_id", updates.id);

  if (deleteFormatsError) {
    console.error(
      "Error deleting existing format associations:",
      deleteFormatsError
    );
  }

  // Then insert new associations if we have quote request formats
  if (updates.quote_request_id) {
    const { data: quoteRequestFormats, error: quoteRequestFormatsError } =
      await supabase
        .from("quote_request_formats")
        .select("id, format_id")
        .eq("quote_request_id", updates.quote_request_id);

    if (quoteRequestFormatsError) {
      console.error(
        "Error fetching quote request formats:",
        quoteRequestFormatsError.message
      );
    } else if (quoteRequestFormats && quoteRequestFormats.length > 0) {
      const formatsToInsert = quoteRequestFormats.map((qrf) => ({
        supplier_quote_id: updates.id,
        format_id: qrf.format_id,
        quote_request_format_id: qrf.id,
      }));

      const { error: formatInsertError } = await supabase
        .from("supplier_quote_formats")
        .insert(formatsToInsert);

      if (formatInsertError) {
        console.error(
          "Error inserting format associations:",
          formatInsertError
        );
      }
    }
  }

  // Handle price breaks (delete and recreate)
  // First delete existing price breaks
  const { error: deletePriceBreaksError } = await supabase
    .from("supplier_quote_price_breaks")
    .delete()
    .eq("supplier_quote_id", updates.id);

  if (deletePriceBreaksError) {
    console.error(
      "Error deleting existing price breaks:",
      deletePriceBreaksError
    );
  }

  // Then insert new price breaks if any
  if (updates.price_breaks && updates.price_breaks.length > 0) {
    // Create a map to store format IDs for each quote_request_format_id
    const formatIdMap = new Map();
    if (updates.quote_request_id) {
      const { data: quoteRequestFormats } = await supabase
        .from("quote_request_formats")
        .select("id, format_id")
        .eq("quote_request_id", updates.quote_request_id);

      if (quoteRequestFormats) {
        quoteRequestFormats.forEach((qrf) => {
          formatIdMap.set(qrf.id, qrf.format_id);
        });
      }
    }

    const priceBreaksToInsert = updates.price_breaks.map((pb) => {
      // Get format_id from our map based on the quote_request_format_id
      const format_id = formatIdMap.get(pb.quote_request_format_id);

      return {
        supplier_quote_id: updates.id,
        quote_request_format_id: pb.quote_request_format_id,
        price_break_id: pb.price_break_id,
        product_id: pb.product_id || null,
        format_id: format_id || null,
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
    }
  }

  // Handle extra costs (delete and recreate)
  // First delete existing extra costs
  const { error: deleteExtraCostsError } = await supabase
    .from("supplier_quote_extra_costs")
    .delete()
    .eq("supplier_quote_id", updates.id);

  if (deleteExtraCostsError) {
    console.error(
      "Error deleting existing extra costs:",
      deleteExtraCostsError
    );
  }

  // Then insert new extra costs if any
  if (updates.extra_costs && updates.extra_costs.length > 0) {
    const standardExtraCosts = updates.extra_costs.filter(
      (ec) => ec.unit_of_measure_id !== "d53da411-5061-4710-aa1d-75a638c45dc6"
    );

    const priceBreakExtraCosts = updates.extra_costs.filter(
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
        supplier_quote_id: updates.id,
        extra_cost_id: ec.extra_cost_id,
        unit_cost: ec.unit_cost === undefined ? null : ec.unit_cost,
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

    console.log("Standard Extra Costs to Insert:", standardCostsToInsert);

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
        supplier_quote_id: updates.id,
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

    // Update extra cost price breaks
    await updateSupplierQuoteExtraCostPriceBreaks(
      updates.id,
      priceBreakExtraCosts
    );
  }

  // Handle savings (delete and recreate)
  // First delete existing savings
  const { error: deleteSavingsError } = await supabase
    .from("supplier_quote_savings")
    .delete()
    .eq("supplier_quote_id", updates.id);

  if (deleteSavingsError) {
    console.error("Error deleting existing savings:", deleteSavingsError);
  }

  // Then insert new savings if any
  if (updates.savings && updates.savings.length > 0) {
    const savingsToInsert = updates.savings
      .filter((s) => {
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
        supplier_quote_id: updates.id,
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
      }
    }
  }

  // Record audit entry
  await recordSupplierQuoteAudit(id, userId, "update", {
    new: updates,
  });

  return id;
}
