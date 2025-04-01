
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { recordSupplierQuoteAudit } from "./supplierQuoteAudit";

export async function createSupplierQuote(
  formData: SupplierQuoteFormValues,
  organizationId: string,
  userId: string
): Promise<string> {
  // Log the entire form data for debugging
  console.log('Full Supplier Quote Form Data:', JSON.stringify(formData, null, 2));

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
  console.log('Supplier Quote Insertion Error:', error);

  if (error) {
    throw new Error(`Error creating supplier quote: ${error.message}`);
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
