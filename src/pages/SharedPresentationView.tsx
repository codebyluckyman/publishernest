import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import PresentationSections from "@/components/sales-presentations/PresentationSections";
import { PresentationDisplaySettings, CardColumn, DialogColumn } from '@/types/salesPresentation';

// Assuming this is a simplified view of the presentation for shared links
const SharedPresentationView = () => {
  const { id } = useParams<{ id: string }>();
  const [presentation, setPresentation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch the shared presentation data
    const fetchPresentation = async () => {
      try {
        // Replace with actual API call to fetch shared presentation
        const response = await fetch(`/api/shared-presentations/${id}`);
        const data = await response.json();
        setPresentation(data);
      } catch (err) {
        setError('Failed to load presentation');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchPresentation();
    }
  }, [id]);
  
  if (loading) return <div>Loading shared presentation...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!presentation) return <div>Presentation not found</div>;
  
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
    <div className="space-y-6">
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
          presentationId={id!}
          isEditable={false}
          displaySettings={processedDisplaySettings}
        />
      </div>
    </div>
  );
};

export default SharedPresentationView;
