
import { supabase } from '@/integrations/supabase/client';

interface DeviceInfo {
  userAgent?: string;
  language?: string;
  screenSize?: string;
  [key: string]: any;
}

export async function trackPresentationView(
  presentationId: string,
  viewId: string,
  deviceInfo: DeviceInfo = {}
): Promise<boolean> {
  try {
    // Get the IP address from a free service (optional - can be removed if privacy concerns)
    let ipAddress: string | null = null;
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ipAddress = data.ip;
    } catch (error) {
      console.error('Failed to get IP address:', error);
      // Continue without IP - non-critical
    }
    
    // Insert a new view record
    const { error } = await supabase
      .from('presentation_analytics')
      .insert({
        presentation_id: presentationId,
        view_id: viewId,
        viewer_ip: ipAddress,
        viewer_device: deviceInfo.userAgent,
        viewer_location: null, // Would require a separate geolocation service
        items_viewed: [],
        sections_viewed: [],
        view_duration: 0 // Will be updated on page unload or via a timer
      });
      
    if (error) {
      console.error('Error tracking presentation view:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to track presentation view:', error);
    return false;
  }
}
