
import { supabase } from '@/integrations/supabase/client';

export interface SupplierCommunication {
  id: string;
  purchase_order_id: string;
  created_by: string;
  message: string;
  communication_type: 'email' | 'phone' | 'note' | 'other';
  communication_date: string;
  created_at: string;
  creator?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

export const fetchSupplierCommunications = async (purchaseOrderId: string): Promise<SupplierCommunication[]> => {
  const { data, error } = await supabase
    .from('supplier_communications')
    .select(`
      *,
      creator:profiles(first_name, last_name, email)
    `)
    .eq('purchase_order_id', purchaseOrderId)
    .order('communication_date', { ascending: false });

  if (error) throw new Error(error.message);
  
  // Handle the creator field properly by mapping it
  const communications = data?.map(comm => {
    // Ensure the creator field has the right shape
    const creator = comm.creator && typeof comm.creator === 'object' && 'email' in comm.creator
      ? comm.creator
      : undefined;
    
    return {
      ...comm,
      communication_type: comm.communication_type as 'email' | 'phone' | 'note' | 'other',
      creator
    };
  }) || [];
  
  return communications as SupplierCommunication[];
};
