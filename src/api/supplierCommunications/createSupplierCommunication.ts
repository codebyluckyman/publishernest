
import { supabase } from '@/integrations/supabase/client';

interface CreateSupplierCommunicationParams {
  purchaseOrderId: string;
  createdBy: string;
  message: string;
  communicationType: 'email' | 'phone' | 'note' | 'other';
}

export const createSupplierCommunication = async (params: CreateSupplierCommunicationParams): Promise<string> => {
  const { purchaseOrderId, createdBy, message, communicationType } = params;
  
  const { data, error } = await supabase.rpc(
    'record_supplier_communication',
    {
      p_purchase_order_id: purchaseOrderId,
      p_created_by: createdBy,
      p_message: message,
      p_communication_type: communicationType
    }
  );

  if (error) throw new Error(error.message);
  return data;
};
