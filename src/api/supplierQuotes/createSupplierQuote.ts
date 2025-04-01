
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

  if (error) {
    throw new Error(`Error creating supplier quote: ${error.message}`);
  }

  // Insert price breaks
  if (formData.price_breaks && formData.price_breaks.length > 0) {
    const priceBreaksToInsert = formData.price_breaks.map(pb => {
      // Create a base object with the required fields
      const priceBreakData: Record<string, any> = {
        supplier_quote_id: supplierQuote.id,
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

    // Instead of passing the array directly to insert, destructure it to avoid the TypeScript error
    const { error: priceBreaksError } = await supabase
      .from("supplier_quote_price_breaks")
      .insert(priceBreaksToInsert as any[]);

    if (priceBreaksError) {
      throw new Error(`Error inserting price breaks: ${priceBreaksError.message}`);
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
