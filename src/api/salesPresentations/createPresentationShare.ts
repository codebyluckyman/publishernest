
import { supabase } from '@/integrations/supabase/client';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { v4 as uuidv4 } from 'uuid';

interface CreatePresentationShareParams {
  presentationId: string;
  sharedBy: string;
  sharedWith?: string;
  expiresAt?: string;
}

export async function createPresentationShare({
  presentationId,
  sharedBy,
  sharedWith,
  expiresAt,
}: CreatePresentationShareParams): Promise<string | null> {
  try {
    // First, get the presentation's access code
    const { data: presentation, error: presentationError } = await supabaseCustom
      .from('sales_presentations')
      .select('access_code')
      .eq('id', presentationId)
      .single();

    if (presentationError || !presentation) {
      console.error('Error fetching presentation access code:', presentationError);
      return null;
    }

    // Generate the share link using the access code
    const shareLink = `${window.location.origin}/shared/presentation/${presentation.access_code}`;

    const { data, error } = await supabaseCustom
      .from('presentation_shares')
      .insert({
        presentation_id: presentationId,
        shared_by: sharedBy,
        shared_with: sharedWith,
        share_link: shareLink,
        expires_at: expiresAt
      })
      .select('share_link')
      .single();

    if (error) {
      console.error('Error creating presentation share:', error);
      return null;
    }

    return data.share_link;
  } catch (error) {
    console.error('Failed to create presentation share:', error);
    return null;
  }
}
