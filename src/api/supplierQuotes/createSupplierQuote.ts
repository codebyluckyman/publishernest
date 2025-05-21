import { supabaseCustom } from "@/integrations/supabase/client-custom";
import { v4 as uuidv4 } from 'uuid';

interface ExtraCost {
  extra_cost_id: string;
  unit_cost: number | null;
  unit_cost_1: number | null;
  unit_cost_2: number | null;
  unit_cost_3: number | null;
  unit_cost_4: number | null;
  unit_cost_5: number | null;
  unit_cost_6: number | null;
  unit_cost_7: number | null;
  unit_cost_8: number | null;
  unit_cost_9: number | null;
  unit_cost_10: number | null;
  unit_of_measure_id: string;
}

interface CreateSupplierQuoteParams {
  organization_id: string;
  supplier_id: string;
  product_id: string;
  format_id: string;
  quantity: number;
  unit_price: number;
  currency: string;
  lead_time: string;
  moq: number;
  notes?: string;
  extraCostsWithPrices: ExtraCost[];
  supplier_quote_id?: string;
}

export async function createSupplierQuote({
  organization_id,
  supplier_id,
  product_id,
  format_id,
  quantity,
  unit_price,
  currency,
  lead_time,
  moq,
  notes,
  extraCostsWithPrices,
  supplier_quote_id
}: CreateSupplierQuoteParams): Promise<string | null> {
  try {
    const quoteId = supplier_quote_id || uuidv4();

    // Insert the supplier quote
    const { data, error } = await supabaseCustom
      .from('supplier_quotes')
      .insert({
        id: quoteId,
        organization_id,
        supplier_id,
        product_id,
        format_id,
        quantity,
        unit_price,
        currency,
        lead_time,
        moq,
        notes,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating supplier quote:', error);
      throw error;
    }

    const extraCostInserts = extraCostsWithPrices.map(ec => ({
      supplier_quote_id: quoteId,
      extra_cost_id: ec.extra_cost_id,
      unit_cost: typeof ec.unit_cost === 'number' ? ec.unit_cost : null,
      unit_cost_1: typeof ec.unit_cost_1 === 'number' ? ec.unit_cost_1 : null,
      unit_cost_2: typeof ec.unit_cost_2 === 'number' ? ec.unit_cost_2 : null,
      unit_cost_3: typeof ec.unit_cost_3 === 'number' ? ec.unit_cost_3 : null,
      unit_cost_4: typeof ec.unit_cost_4 === 'number' ? ec.unit_cost_4 : null,
      unit_cost_5: typeof ec.unit_cost_5 === 'number' ? ec.unit_cost_5 : null,
      unit_cost_6: typeof ec.unit_cost_6 === 'number' ? ec.unit_cost_6 : null,
      unit_cost_7: typeof ec.unit_cost_7 === 'number' ? ec.unit_cost_7 : null,
      unit_cost_8: typeof ec.unit_cost_8 === 'number' ? ec.unit_cost_8 : null,
      unit_cost_9: typeof ec.unit_cost_9 === 'number' ? ec.unit_cost_9 : null,
      unit_cost_10: typeof ec.unit_cost_10 === 'number' ? ec.unit_cost_10 : null,
      unit_of_measure_id: ec.unit_of_measure_id
    }));

    if (extraCostInserts.length > 0) {
      const { error: extraCostsError } = await supabaseCustom
        .from('supplier_quote_extra_costs')
        .insert(extraCostInserts);
        
      if (extraCostsError) {
        console.error('Error inserting extra costs:', extraCostsError);
        throw extraCostsError;
      }
    }

    return data.id;
  } catch (error) {
    console.error('Failed to create supplier quote:', error);
    return null;
  }
}
