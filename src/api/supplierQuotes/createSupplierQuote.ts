
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

  // Insert extra costs price breaks
  if (formData.extra_costs && formData.extra_costs.length > 0) {
    const extraCostsPriceBreaksToInsert: any[] = [];
    
    formData.extra_costs.forEach(ec => {
      if (ec.price_breaks && ec.price_breaks.length > 0) {
        ec.price_breaks.forEach(pb => {
          extraCostsPriceBreaksToInsert.push({
            supplier_quote_id: supplierQuote.id,
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
      const { error: extraCostsError } = await supabase
        .from("supplier_quote_extra_costs_price_breaks")
        .insert(extraCostsPriceBreaksToInsert);

      if (extraCostsError) {
        throw new Error(`Error inserting extra costs price breaks: ${extraCostsError.message}`);
      }
    }
  }

  // Insert savings price breaks
  if (formData.savings && formData.savings.length > 0) {
    const savingsPriceBreaksToInsert: any[] = [];
    
    formData.savings.forEach(s => {
      // Keep track of notes for each saving
      const notes = s.notes || null;
      
      if (s.price_breaks && s.price_breaks.length > 0) {
        s.price_breaks.forEach(pb => {
          savingsPriceBreaksToInsert.push({
            supplier_quote_id: supplierQuote.id,
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
      const { error: savingsError } = await supabase
        .from("supplier_quote_savings_price_breaks")
        .insert(savingsPriceBreaksToInsert);

      if (savingsError) {
        throw new Error(`Error inserting savings price breaks: ${savingsError.message}`);
      }
    }
  }

  // Insert formats
  if (formData.price_breaks && formData.price_breaks.length > 0) {
    // Get unique quote_request_format_ids from price breaks
    const uniqueFormatIds = [...new Set(formData.price_breaks.map(pb => pb.quote_request_format_id))];
    
    // Get format information for each quote request format
    const { data: quoteRequestFormats, error: formatError } = await supabase
      .from("quote_request_formats")
      .select("id, format_id")
      .in("id", uniqueFormatIds);
    
    if (formatError) {
      throw new Error(`Error fetching format information: ${formatError.message}`);
    }
    
    if (quoteRequestFormats && quoteRequestFormats.length > 0) {
      const formatsToInsert = quoteRequestFormats.map(qrf => ({
        supplier_quote_id: supplierQuote.id,
        format_id: qrf.format_id,
        quote_request_format_id: qrf.id
      }));
      
      const { error: insertFormatsError } = await supabase
        .from("supplier_quote_formats")
        .insert(formatsToInsert);
        
      if (insertFormatsError) {
        throw new Error(`Error inserting formats: ${insertFormatsError.message}`);
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
