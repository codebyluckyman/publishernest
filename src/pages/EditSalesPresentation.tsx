
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSalesPresentations } from '@/hooks/useSalesPresentations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { PresentationSections } from '@/components/sales-presentations/PresentationSections';
import { PresentationDisplaySettings } from '@/types/salesPresentation';

const EditSalesPresentation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usePresentation, useUpdatePresentation } = useSalesPresentations();
  
  const { data: presentation, isLoading } = usePresentation(id);
  const updateMutation = useUpdatePresentation();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (presentation) {
      setTitle(presentation.title);
      setDescription(presentation.description || '');
    }
  }, [presentation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    try {
      setError(null);
      await updateMutation.mutateAsync({
        id,
        title,
        description
      });
      
      navigate(`/sales-presentations/${id}`);
    } catch (err) {
      setError('Failed to update presentation');
      console.error(err);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!presentation) {
    return <div>Presentation not found</div>;
  }

  // Process display settings for backward compatibility
  const displaySettings = presentation.display_settings || {};
  
  // Create a properly typed displaySettings object
  const processedDisplaySettings: PresentationDisplaySettings = {
    cardColumns: Array.isArray(displaySettings.cardColumns) 
      ? displaySettings.cardColumns 
      : (Array.isArray(displaySettings.displayColumns) 
          ? displaySettings.displayColumns 
          : ['price', 'isbn13', 'publisher']),
    dialogColumns: Array.isArray(displaySettings.dialogColumns) 
      ? displaySettings.dialogColumns 
      : (Array.isArray(displaySettings.displayColumns) 
          ? [...displaySettings.displayColumns, 'synopsis'] 
          : ['price', 'isbn13', 'publisher', 'publication_date', 'synopsis'])
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate(`/sales-presentations/${id}`)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Presentation
        </Button>
        <h1 className="text-2xl font-bold">Edit Presentation</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-32"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Presentation Content</CardTitle>
          </CardHeader>
          <CardContent>
            <PresentationSections 
              presentationId={id!}
              isEditable={true}
              displaySettings={processedDisplaySettings}
            />
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/sales-presentations/${id}`)}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditSalesPresentation;
