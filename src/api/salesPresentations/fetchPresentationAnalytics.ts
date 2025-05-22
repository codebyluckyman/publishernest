
import { supabaseCustom } from '@/integrations/supabase/client-custom';

export interface PresentationAnalyticsSummary {
  totalViews: number;
  uniqueViewers: number;
  averageViewTimeSeconds: number;
  totalViewTimeSeconds: number;
  viewsByDate: Record<string, number>;
}

export async function fetchPresentationAnalytics(presentationId: string): Promise<PresentationAnalyticsSummary> {
  try {
    const { data, error } = await supabaseCustom.rpc('get_presentation_analytics_summary', {
      p_presentation_id: presentationId
    });

    if (error) {
      console.error('Error fetching presentation analytics:', error);
      throw error;
    }
    
    // If no data or no presentations found, return empty analytics
    if (!data || data.length === 0) {
      return {
        totalViews: 0,
        uniqueViewers: 0,
        averageViewTimeSeconds: 0,
        totalViewTimeSeconds: 0,
        viewsByDate: {}
      };
    }
    
    // Format the analytics data
    const analytics = data[0];
    
    return {
      totalViews: Number(analytics.total_views) || 0,
      uniqueViewers: Number(analytics.unique_viewers) || 0,
      averageViewTimeSeconds: Number(analytics.average_view_time_seconds) || 0,
      totalViewTimeSeconds: Number(analytics.total_view_time_seconds) || 0,
      viewsByDate: analytics.views_by_date || {}
    };
  } catch (error) {
    console.error('Failed to fetch presentation analytics:', error);
    // Return empty analytics on error
    return {
      totalViews: 0,
      uniqueViewers: 0,
      averageViewTimeSeconds: 0,
      totalViewTimeSeconds: 0,
      viewsByDate: {}
    };
  }
}
