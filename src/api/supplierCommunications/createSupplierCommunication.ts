
import { supabase } from '@/integrations/supabase/client';

interface CreateSupplierCommunicationParams {
  purchaseOrderId: string;
  createdBy: string;
  message: string;
  communicationType: 'email' | 'phone' | 'note' | 'other';
}

export const createSupplierCommunication = async (params: CreateSupplierCommunicationParams): Promise<string> => {
  const { purchaseOrderId, createdBy, message, communicationType } = params;
  
  // Since we're using a custom function that might not be in TypeScript definitions,
  // we'll use the standard insert method instead of rpc
  const { data, error } = await supabase
    .from('supplier_communications')
    .insert({
      purchase_order_id: purchaseOrderId,
      created_by: createdBy,
      message: message,
      communication_type: communicationType
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id;
};
