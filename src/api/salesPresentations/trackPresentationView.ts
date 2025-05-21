
import { supabaseCustom } from '@/integrations/supabase/client-custom';
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
    
    try {
      // Use our new public function for tracking views
      await supabaseCustom.rpc('track_presentation_public_access', {
        p_presentation_id: presentationId,
        p_view_id: currentViewId,
      });
      
      // If we have additional viewer info and this isn't just a heartbeat update,
      // we can update the analytics record with this extra information
      if (viewerInfo && (viewerInfo.ip || viewerInfo.device || viewerInfo.location)) {
        const { error: updateError } = await supabaseCustom
          .from('presentation_analytics')
          .update({
            viewer_ip: viewerInfo?.ip,
            viewer_device: viewerInfo?.device,
            viewer_location: viewerInfo?.location,
          })
          .eq('presentation_id', presentationId)
          .eq('view_id', currentViewId);
          
        if (updateError) {
          console.error('Error updating presentation view details:', updateError);
        }
      }
    } catch (error) {
      console.error('Error tracking presentation view:', error);
    }
    
    return currentViewId;
  } catch (error) {
    console.error('Failed to track presentation view:', error);
    // Return the viewId even if tracking failed
    return viewId || uuidv4();
  }
}
