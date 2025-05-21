
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { PresentationSections } from '@/components/sales-presentations/PresentationSections';
import { PresentationDisplaySettings } from '@/types/salesPresentation';
import { fetchSharedPresentation } from '@/api/salesPresentations/fetchSharedPresentation';
import { trackPresentationView } from '@/api/salesPresentations/trackPresentationView';

const SharedPresentationView = () => {
  const { accessCode } = useParams<{ accessCode: string }>();
  const [presentation, setPresentation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch the shared presentation data by access code
    const fetchPresentation = async () => {
      try {
        if (!accessCode) {
          setError('Invalid access code');
          setLoading(false);
          return;
        }
        
        console.log('Fetching presentation with access code:', accessCode);
        const { data, error } = await fetchSharedPresentation(accessCode);
        
        if (error) {
          console.error('Error fetching presentation:', error);
          setError('Failed to load presentation');
          setLoading(false);
          return;
        }
        
        if (!data) {
          console.error('No presentation data found');
          setError('Presentation not found');
          setLoading(false);
          return;
        }
        
        console.log('Presentation fetched successfully:', data);
        setPresentation(data);
        
        // Track the presentation view
        const newViewId = await trackPresentationView({
          presentationId: data.id,
          viewerInfo: {
            device: navigator.userAgent,
          }
        });
        
        setViewId(newViewId);
      } catch (err) {
        console.error('Error in shared presentation view:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPresentation();
  }, [accessCode]);
  
  // Send periodic heartbeats to update last_activity for analytics
  useEffect(() => {
    if (!presentation?.id || !viewId) return;
    
    console.log('Setting up heartbeat interval for view:', viewId);
    const heartbeatInterval = setInterval(async () => {
      try {
        await trackPresentationView({
          presentationId: presentation.id,
          viewId: viewId
        });
        console.log('Heartbeat sent for view:', viewId);
      } catch (err) {
        console.error('Failed to update view activity:', err);
      }
    }, 60000); // Every minute
    
    return () => {
      console.log('Cleaning up heartbeat interval');
      clearInterval(heartbeatInterval);
    };
  }, [presentation?.id, viewId]);
  
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading presentation...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen">Error: {error}</div>;
  if (!presentation) return <div className="flex items-center justify-center min-h-screen">Presentation not found</div>;
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{presentation.title}</h1>
        {presentation.description && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">{presentation.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="mt-8">
        <PresentationSections
          presentationId={presentation.id}
          isEditable={false}
          displaySettings={presentation.display_settings as PresentationDisplaySettings}
        />
      </div>
    </div>
  );
};

export default SharedPresentationView;
