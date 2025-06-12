import { supabaseCustom } from "@/integrations/supabase/client-custom";
import { NewPurchaseOrderLineItem } from "@/types/purchaseOrderLineItem";

interface CreatePurchaseOrderLineItemInput extends NewPurchaseOrderLineItem {
  purchase_order_id: string;
}

export async function createPurchaseOrderLineItem(
  data: CreatePurchaseOrderLineItemInput
): Promise<string> {
  const { error, data: result } = await supabaseCustom
    .from("purchase_order_line_items")
    .insert({
      purchase_order_id: data.purchase_order_id,
      product_id: data.product_id,
      format_id: data.format_id,
      quantity: data.quantity,
      production_quantity: data.production_quantity || 0,
      transit_quantity: data.transit_quantity || 0,
      received_quantity: data.received_quantity || 0,
      unit_cost: data.unit_cost,
      tax_rate: data.tax_rate,
      tax_amount: data.tax_amount,
      total_cost: data.total_cost,
      supplier_quote_id: data.supplier_quote_id,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating purchase order line item:", error);
    throw error;
  }

  return result.id;
}
