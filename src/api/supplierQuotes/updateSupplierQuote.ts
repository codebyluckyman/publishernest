
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
      // New fields for multiple product unit costs
      unit_cost_1: pb.unit_cost_1,
      unit_cost_2: pb.unit_cost_2,
      unit_cost_3: pb.unit_cost_3,
      unit_cost_4: pb.unit_cost_4
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
    // First delete existing extra costs for this supplier quote
    const { error: deleteError } = await supabase
      .from("supplier_quote_extra_costs")
      .delete()
      .eq("supplier_quote_id", id);

    if (deleteError) {
      throw new Error(`Error deleting existing extra costs: ${deleteError.message}`);
    }

    // Insert updated extra costs
    const extraCostsToInsert = updates.extra_costs.map(ec => ({
      supplier_quote_id: id,
      extra_cost_id: ec.extra_cost_id,
      unit_cost: ec.unit_cost,
      notes: ec.notes || null
    }));

    const { error: insertError } = await supabase
      .from("supplier_quote_extra_costs")
      .insert(extraCostsToInsert);

    if (insertError) {
      throw new Error(`Error inserting updated extra costs: ${insertError.message}`);
    }
  }

  // Update savings if provided
  if (updates.savings && updates.savings.length > 0) {
    // First delete existing savings for this supplier quote
    const { error: deleteError } = await supabase
      .from("supplier_quote_savings")
      .delete()
      .eq("supplier_quote_id", id);

    if (deleteError) {
      throw new Error(`Error deleting existing savings: ${deleteError.message}`);
    }

    // Insert updated savings
    const savingsToInsert = updates.savings.map(s => ({
      supplier_quote_id: id,
      saving_id: s.saving_id,
      unit_cost: s.unit_cost,
      notes: s.notes || null
    }));

    const { error: insertError } = await supabase
      .from("supplier_quote_savings")
      .insert(savingsToInsert);

    if (insertError) {
      throw new Error(`Error inserting updated savings: ${insertError.message}`);
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
