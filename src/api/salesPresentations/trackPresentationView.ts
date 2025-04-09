
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface TrackPresentationViewParams {
  presentationId: string;
  viewId?: string;
  viewerInfo?: {
    ip?: string;
    device?: string;
    location?: string;
  };
}

export async function trackPresentationView({
  presentationId,
  viewId,
  viewerInfo,
}: TrackPresentationViewParams): Promise<string> {
  try {
    // If no viewId is provided, create a new one
    const currentViewId = viewId || uuidv4();
    
    // Check if this view already exists
    const { data: existingView, error: fetchError } = await supabase
      .from('presentation_analytics')
      .select('id')
      .eq('presentation_id', presentationId)
      .eq('view_id', currentViewId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is expected if view is new
      console.error('Error checking for existing view:', fetchError);
    }
    
    const now = new Date().toISOString();
    
    if (existingView) {
      // Update existing view record
      const { error: updateError } = await supabase
        .from('presentation_analytics')
        .update({
          last_activity: now,
        })
        .eq('id', existingView.id);
        
      if (updateError) {
        console.error('Error updating presentation view:', updateError);
      }
    } else {
      // Create new view record
      const { error: insertError } = await supabase
        .from('presentation_analytics')
        .insert({
          presentation_id: presentationId,
          view_id: currentViewId,
          viewer_ip: viewerInfo?.ip,
          viewer_device: viewerInfo?.device,
          viewer_location: viewerInfo?.location,
          view_date: now,
          last_activity: now,
        });
        
      if (insertError) {
        console.error('Error tracking presentation view:', insertError);
      }
    }
    
    return currentViewId;
  } catch (error) {
    console.error('Failed to track presentation view:', error);
    // Return the viewId even if tracking failed
    return viewId || uuidv4();
  }
}
