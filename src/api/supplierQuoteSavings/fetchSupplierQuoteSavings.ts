
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuoteSaving } from "@/types/supplierQuote";

export async function fetchSupplierQuoteSavings(supplierQuoteId: string): Promise<SupplierQuoteSaving[]> {
  if (!supplierQuoteId) return [];
  
  // Since TypeScript doesn't recognize supplier_quote_savings in the type definitions yet,
  // we need to use the any type for the query result
  const { data, error } = await supabase
    .from('supplier_quote_savings')
    .select(`
      *,
      savings:saving_id(*),
      unit_of_measures:unit_of_measure_id(*)
    `)
    .eq('supplier_quote_id', supplierQuoteId);
  
  if (error) throw error;
  
  if (!data) return [];
  
  // Transform data to match SupplierQuoteSaving type
  return data.map(item => {
    // Create the base saving data object
    const savingData: any = {
      id: item.id,
      supplier_quote_id: item.supplier_quote_id,
      saving_id: item.saving_id,
      price_break_id: item.price_break_id || null,
      unit_cost: item.unit_cost,
      unit_cost_1: item.unit_cost_1,
      unit_cost_2: item.unit_cost_2,
      unit_cost_3: item.unit_cost_3,
      unit_cost_4: item.unit_cost_4,
      unit_cost_5: item.unit_cost_5,
      unit_cost_6: item.unit_cost_6,
      unit_cost_7: item.unit_cost_7,
      unit_cost_8: item.unit_cost_8,
      unit_cost_9: item.unit_cost_9,
      unit_cost_10: item.unit_cost_10,
      unit_of_measure_id: item.unit_of_measure_id
    };

    // Add additional properties for UI display if available
    if (item.savings) {
      savingData.saving_name = item.savings.name;
      savingData.saving_description = item.savings.description;
    }

    if (item.unit_of_measures) {
      savingData.unit_of_measure_name = item.unit_of_measures.name 
        ? (item.unit_of_measures.abbreviation 
          ? `${item.unit_of_measures.name} (${item.unit_of_measures.abbreviation})`
          : item.unit_of_measures.name) 
        : null;
      savingData.is_inventory_unit = item.unit_of_measures.is_inventory_unit || false;
    }

    return savingData as SupplierQuoteSaving;
  });
}
