
import { supabase } from "@/integrations/supabase/client";
import { SupplierQuoteSaving } from "@/types/supplierQuote";

export async function fetchSupplierQuoteSavings(supplierQuoteId: string): Promise<SupplierQuoteSaving[]> {
  if (!supplierQuoteId) return [];
  
  const { data, error } = await supabase
    .from('supplier_quote_savings')
    .select(`
      *,
      quote_request_savings!inner(*),
      unit_of_measures(*)
    `)
    .eq('supplier_quote_id', supplierQuoteId);
  
  if (error) throw error;
  
  if (!data) return [];
  
  // Transform data to match SupplierQuoteSaving type
  return data.map(item => ({
    id: item.id,
    supplier_quote_id: item.supplier_quote_id,
    saving_id: item.saving_id,
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
    unit_of_measure_id: item.unit_of_measure_id,
    // Additional properties from the related tables
    saving_name: item.quote_request_savings?.name,
    saving_description: item.quote_request_savings?.description,
    unit_of_measure_name: item.unit_of_measures?.name 
      ? (item.unit_of_measures?.abbreviation 
         ? `${item.unit_of_measures.name} (${item.unit_of_measures.abbreviation})`
         : item.unit_of_measures.name) 
      : null,
    is_inventory_unit: item.unit_of_measures?.is_inventory_unit || false
  }));
}
