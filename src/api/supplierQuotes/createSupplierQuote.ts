
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";

export async function createSupplierQuote(
  formData: SupplierQuoteFormValues,
  organizationId: string,
  userId: string
): Promise<string> {
  // Start a transaction
  const { data: supplierQuote, error } = await supabase
    .from("supplier_quotes")
    .insert({
      organization_id: organizationId,
      quote_request_id: formData.quote_request_id,
      supplier_id: formData.supplier_id,
      currency: formData.currency,
      notes: formData.notes || null,
      status: "draft",
      reference: formData.reference || null,
      // New fields
      valid_from: formData.valid_from || null,
      valid_to: formData.valid_to || null,
      terms: formData.terms || null,
      remarks: formData.remarks || null
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating supplier quote: ${error.message}`);
  }

  // Insert price breaks
  if (formData.price_breaks && formData.price_breaks.length > 0) {
    const priceBreaksToInsert = formData.price_breaks.map(pb => ({
      supplier_quote_id: supplierQuote.id,
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

    const { error: priceBreaksError } = await supabase
      .from("supplier_quote_price_breaks")
      .insert(priceBreaksToInsert);

    if (priceBreaksError) {
      throw new Error(`Error inserting price breaks: ${priceBreaksError.message}`);
    }
  }

  // Insert extra costs
  if (formData.extra_costs && formData.extra_costs.length > 0) {
    const extraCostsToInsert = formData.extra_costs.map(ec => ({
      supplier_quote_id: supplierQuote.id,
      extra_cost_id: ec.extra_cost_id,
      unit_cost: ec.unit_cost,
      notes: ec.notes || null
    }));

    const { error: extraCostsError } = await supabase
      .from("supplier_quote_extra_costs")
      .insert(extraCostsToInsert);

    if (extraCostsError) {
      throw new Error(`Error inserting extra costs: ${extraCostsError.message}`);
    }
  }

  // Insert savings
  if (formData.savings && formData.savings.length > 0) {
    const savingsToInsert = formData.savings.map(s => ({
      supplier_quote_id: supplierQuote.id,
      saving_id: s.saving_id,
      unit_cost: s.unit_cost,
      notes: s.notes || null
    }));

    const { error: savingsError } = await supabase
      .from("supplier_quote_savings")
      .insert(savingsToInsert);

    if (savingsError) {
      throw new Error(`Error inserting savings: ${savingsError.message}`);
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
