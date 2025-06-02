
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
    // Generate a unique identifier for the share link
    const shareToken = uuidv4().replace(/-/g, '').substring(0, 12);
    const shareLink = `${window.location.origin}/shared/presentation/${shareToken}`;

    const { data, error } = await supabaseCustom
      .from('presentation_shares')
      .insert({
        presentation_id: presentationId,
        shared_by: sharedBy,
        shared_with: sharedWith,
        share_link: shareLink,
        share_token: shareToken, // Added missing share_token field
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
