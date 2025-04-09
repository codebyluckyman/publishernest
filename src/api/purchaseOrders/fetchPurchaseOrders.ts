
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { PurchaseOrder } from '@/types/purchaseOrder';

interface FetchPurchaseOrdersOptions {
  organizationId: string;
  printRunId?: string;
  supplierId?: string;
  status?: string;
}

export async function fetchPurchaseOrders({
  organizationId,
  printRunId,
  supplierId,
  status,
}: FetchPurchaseOrdersOptions): Promise<PurchaseOrder[]> {
  let query = supabaseCustom
    .from('purchase_orders')
    .select(`
      *,
      print_run:print_run_id(*),
      supplier:supplier_id(*)
    `)
    .eq('organization_id', organizationId);

  // Add optional filters
  if (printRunId) {
    query = query.eq('print_run_id', printRunId);
  }
  if (supplierId) {
    query = query.eq('supplier_id', supplierId);
  }
  if (status) {
    query = query.eq('status', status);
  }

  // Order by created date, newest first
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching purchase orders:', error);
    throw error;
  }

  return data as unknown as PurchaseOrder[];
}
