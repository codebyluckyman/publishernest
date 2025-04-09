
import { supabase } from '@/integrations/supabase/client';
import { SalesPresentation } from '@/types/salesPresentation';

interface UpdateSalesPresentationParams {
  id: string;
  title?: string;
  description?: string;
  status?: 'draft' | 'published' | 'archived';
  coverImageUrl?: string;
  expiresAt?: string;
}

export async function updateSalesPresentation({
  id,
  title,
  description,
  status,
  coverImageUrl,
  expiresAt,
}: UpdateSalesPresentationParams): Promise<boolean> {
  try {
    const updates: Partial<SalesPresentation> = {};
    
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (coverImageUrl !== undefined) updates.cover_image_url = coverImageUrl;
    if (expiresAt !== undefined) updates.expires_at = expiresAt;
    
    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('sales_presentations')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating sales presentation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update sales presentation:', error);
    return false;
  }
}
