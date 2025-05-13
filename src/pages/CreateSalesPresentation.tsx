
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { CreatePresentationForm } from '@/components/sales-presentations/CreatePresentationForm';
import { useSalesPresentations } from '@/hooks/useSalesPresentations';
import { CardGridLayout, PresentationViewMode } from '@/types/salesPresentation';

const CreateSalesPresentation = () => {
  const navigate = useNavigate();
  const { useCreatePresentation } = useSalesPresentations();
  const createPresentation = useCreatePresentation();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    try {
      setError(null);
      
      // Process cardGridLayout if exists (convert from string values to numbers)
      let processedCardGridLayout: CardGridLayout | undefined = undefined;
      
      if (formData.cardGridLayout) {
        processedCardGridLayout = {
          sm: formData.cardGridLayout.sm !== undefined ? Number(formData.cardGridLayout.sm) : 1,
          md: formData.cardGridLayout.md !== undefined ? Number(formData.cardGridLayout.md) : 2,
          lg: formData.cardGridLayout.lg !== undefined ? Number(formData.cardGridLayout.lg) : 3,
          xl: formData.cardGridLayout.xl !== undefined ? Number(formData.cardGridLayout.xl) : 4,
          xxl: formData.cardGridLayout.xxl !== undefined ? Number(formData.cardGridLayout.xxl) : 5
        };
      }
      
      const displaySettings = {
        cardColumns: formData.cardColumns,
        dialogColumns: formData.dialogColumns,
        defaultView: formData.defaultView as PresentationViewMode,
        features: {
          enabledViews: formData.enabledViews,
          allowViewToggle: formData.allowViewToggle,
          showProductDetails: formData.showProductDetails,
          allowDownload: formData.allowDownload,
          showPricing: formData.showPricing,
          ...(processedCardGridLayout && { cardGridLayout: processedCardGridLayout })
        }
      };
      
      const result = await createPresentation.mutateAsync({
        title: formData.title,
        description: formData.description,
        displaySettings
      });
      
      if (result) {
        navigate(`/sales-presentations/${result}`);
      } else {
        throw new Error('Failed to create sales presentation');
      }
    } catch (err) {
      setError('Failed to create sales presentation. Please try again.');
      console.error('Error creating sales presentation:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/sales-presentations')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Presentations
        </Button>
        <h1 className="text-2xl font-bold">Create Sales Presentation</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Presentation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CreatePresentationForm
            onSubmit={handleSubmit}
            isSubmitting={createPresentation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateSalesPresentation;
