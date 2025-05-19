
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { PresentationSections } from '@/components/sales-presentations/PresentationSections';
import { 
  PresentationDisplaySettings, 
  CardColumn, 
  DialogColumn 
} from '@/types/salesPresentation';
import { fetchSharedPresentation, SharedPresentation } from '@/api/salesPresentations/fetchSharedPresentation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const SharedPresentationView = () => {
  const { accessCode } = useParams<{ accessCode: string }>();
  const [presentation, setPresentation] = useState<SharedPresentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch the shared presentation data
    const fetchPresentation = async () => {
      try {
        if (!accessCode) {
          setError('Invalid access code');
          setLoading(false);
          return;
        }

        setLoading(true);
        const data = await fetchSharedPresentation(accessCode);
        
        if (!data) {
          setError('Presentation not found or has expired');
        } else {
          setPresentation(data);
        }
      } catch (err) {
        console.error('Error fetching presentation:', err);
        setError('Failed to load presentation');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPresentation();
  }, [accessCode]);
  
  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="text-center">
          <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-24 w-full" />
        </div>
        
        <div className="mt-8 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!presentation) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>The requested presentation could not be found or has expired.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
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
    <div className="space-y-6 p-4">
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
          displaySettings={processedDisplaySettings}
          isSharedView={true}
        />
      </div>
    </div>
  );
};

export default SharedPresentationView;
