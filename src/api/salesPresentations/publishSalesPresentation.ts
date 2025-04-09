
import { supabase } from '@/integrations/supabase/client';
import { supabaseCustom } from '@/integrations/supabase/client-custom';

interface PublishSalesPresentationParams {
  id: string;
  expiresAt?: string;
}

export async function publishSalesPresentation({
  id,
  expiresAt,
}: PublishSalesPresentationParams): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    
    const { error } = await supabaseCustom
      .from('sales_presentations')
      .update({
        status: 'published',
        published_at: now,
        expires_at: expiresAt,
        updated_at: now
      })
      .eq('id', id);

    if (error) {
      console.error('Error publishing sales presentation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to publish sales presentation:', error);
    return false;
  }
}
