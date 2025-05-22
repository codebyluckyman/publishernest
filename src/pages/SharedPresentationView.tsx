
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
        
        const { data, error } = await fetchSharedPresentation(accessCode);
        
        if (error || !data) {
          setError('Failed to load presentation');
          setLoading(false);
          return;
        }
        
        setPresentation(data);
        
        // Track the presentation view
        const viewerId = await trackPresentationView({
          presentationId: data.id,
          viewerInfo: {
            device: navigator.userAgent,
          }
        });
        
        setViewId(viewerId);
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
    
    const heartbeatInterval = setInterval(async () => {
      try {
        await trackPresentationView({
          presentationId: presentation.id,
          viewId: viewId
        });
      } catch (err) {
        console.error('Failed to update view activity:', err);
      }
    }, 60000); // Every minute
    
    return () => clearInterval(heartbeatInterval);
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
