
import { supabase } from '@/integrations/supabase/client';
import { SalesPresentation, PresentationDisplaySettings } from '@/types/salesPresentation';

export interface SharedPresentation {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  display_settings?: PresentationDisplaySettings;
  created_at: string;
  published_at?: string;
  expires_at?: string;
}

// Fetch a shared presentation using its access code
export async function fetchSharedPresentation(accessCode: string): Promise<SharedPresentation | null> {
  try {
    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/get-shared-presentation?accessCode=${accessCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching shared presentation:', errorData);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch shared presentation:', error);
    return null;
  }
}

// Update analytics for a shared presentation view
export async function updatePresentationAnalytics(
  viewId: string,
  presentationId: string,
  data: {
    sectionsViewed?: string[];
    itemsViewed?: string[];
    viewDuration?: number;
  }
): Promise<boolean> {
  try {
    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/update-shared-presentation-analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`,
      },
      body: JSON.stringify({
        viewId,
        presentationId,
        sectionsViewed: data.sectionsViewed || [],
        itemsViewed: data.itemsViewed || [],
        viewDuration: data.viewDuration || 0
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error updating presentation analytics:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update presentation analytics:', error);
    return false;
  }
}
