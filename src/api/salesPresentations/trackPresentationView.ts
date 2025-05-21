
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { v4 as uuidv4 } from 'uuid';

interface TrackPresentationViewParams {
  presentationId: string;
  viewId?: string;
  viewerInfo?: {
    ip?: string;
    device?: string;
    browser?: string;
    location?: string;
    referrer?: string;
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
      // Use our public function for tracking views with all available information
      await supabaseCustom.rpc('track_presentation_view', {
        p_presentation_id: presentationId,
        p_view_id: currentViewId,
        p_viewer_ip: viewerInfo?.ip || null,
        p_viewer_device: viewerInfo?.device || null, 
        p_viewer_browser: viewerInfo?.browser || null,
        p_viewer_location: viewerInfo?.location || null,
        p_referrer: viewerInfo?.referrer || null
      });
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

/**
 * Updates the time spent on a presentation view
 */
export async function updatePresentationViewTime(
  presentationId: string,
  viewId: string,
  timeSpentSeconds: number
): Promise<void> {
  try {
    await supabaseCustom.rpc('update_presentation_view_time', {
      p_presentation_id: presentationId,
      p_view_id: viewId,
      p_time_spent_seconds: timeSpentSeconds
    });
  } catch (error) {
    console.error('Failed to update presentation view time:', error);
  }
}

/**
 * Records that a specific section was viewed
 */
export async function recordSectionView(
  presentationId: string,
  viewId: string,
  sectionId: string
): Promise<void> {
  try {
    await supabaseCustom.rpc('record_presentation_section_view', {
      p_presentation_id: presentationId,
      p_view_id: viewId,
      p_section_id: sectionId
    });
  } catch (error) {
    console.error('Failed to record section view:', error);
  }
}

/**
 * Records that a specific item was viewed
 */
export async function recordItemView(
  presentationId: string,
  viewId: string,
  itemId: string
): Promise<void> {
  try {
    await supabaseCustom.rpc('record_presentation_item_view', {
      p_presentation_id: presentationId,
      p_view_id: viewId,
      p_item_id: itemId
    });
  } catch (error) {
    console.error('Failed to record item view:', error);
  }
}
