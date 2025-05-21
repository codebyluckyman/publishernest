
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { PresentationSections } from '@/components/sales-presentations/PresentationSections';
import { SalesPresentation, PresentationDisplaySettings, CardColumn, DialogColumn } from '@/types/salesPresentation';
import { fetchSharedPresentation } from '@/api/salesPresentations/fetchSharedPresentation';
import { trackPresentationView } from '@/api/salesPresentations/trackPresentationView';
import { v4 as uuidv4 } from 'uuid';

const SharedPresentationView = () => {
  const { accessCode } = useParams<{ accessCode: string }>();
  const [presentation, setPresentation] = useState<SalesPresentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Generate a random view ID for analytics
    const viewId = uuidv4();
    let deviceInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenSize: `${window.screen.width}x${window.screen.height}`
    };
    
    // Fetch the shared presentation data
    const fetchPresentation = async () => {
      try {
        if (!accessCode) {
          setError('No access code provided');
          setLoading(false);
          return;
        }
        
        const data = await fetchSharedPresentation(accessCode);
        
        if (!data) {
          setError('Presentation not found or has expired');
          setLoading(false);
          return;
        }
        
        setPresentation(data);
        
        // Track the view (non-blocking)
        if (data.id) {
          trackPresentationView(data.id, viewId, deviceInfo)
            .catch(err => console.error('Error tracking presentation view:', err));
        }
      } catch (err) {
        console.error('Failed to load presentation:', err);
        setError('Failed to load presentation');
      } finally {
        setLoading(false);
      }
    };
    
    if (accessCode) {
      fetchPresentation();
    } else {
      setLoading(false);
      setError('No access code provided');
    }
  }, [accessCode]);
  
  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Loading shared presentation...</h2>
        <p className="text-muted-foreground">Please wait while we load the content</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    </div>
  );
  
  if (!presentation) return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Presentation not found</h2>
        <p className="text-muted-foreground">The presentation you're looking for may have expired or doesn't exist</p>
      </div>
    </div>
  );
  
  // Process display settings for backward compatibility
  const displaySettings = presentation.display_settings || {};
  
  // Create a properly typed displaySettings object
  const processedDisplaySettings: PresentationDisplaySettings = {
    cardColumns: Array.isArray(displaySettings.cardColumns) 
      ? displaySettings.cardColumns as CardColumn[]
      : (Array.isArray(displaySettings.displayColumns) 
          ? displaySettings.displayColumns as CardColumn[]
          : ['price', 'isbn13', 'publisher']),
    dialogColumns: Array.isArray(displaySettings.dialogColumns) 
      ? displaySettings.dialogColumns as DialogColumn[]
      : (Array.isArray(displaySettings.displayColumns) 
          ? [...(displaySettings.displayColumns as DialogColumn[]), 'synopsis' as DialogColumn] 
          : ['price', 'isbn13', 'publisher', 'publication_date', 'synopsis'])
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">{presentation.title}</h1>
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
          displaySettings={processedDisplaySettings}
        />
      </div>
    </div>
  );
};

export default SharedPresentationView;
