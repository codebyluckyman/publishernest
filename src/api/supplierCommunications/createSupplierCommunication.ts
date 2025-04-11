
import { supabase } from '@/integrations/supabase/client';

interface CreateSupplierCommunicationParams {
  purchaseOrderId: string;
  createdBy: string;
  message: string;
  communicationType: 'email' | 'phone' | 'note' | 'other';
}

export const createSupplierCommunication = async (params: CreateSupplierCommunicationParams): Promise<string> => {
  const { purchaseOrderId, createdBy, message, communicationType } = params;
  
  const { data, error } = await supabase
    .from('supplier_communications')
    .insert({
      purchase_order_id: purchaseOrderId,
      created_by: createdBy,
      message: message,
      communication_type: communicationType,
      communication_date: new Date().toISOString()
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id;
};
