
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSalesPresentations } from '@/hooks/useSalesPresentations';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PresentationSections } from '@/components/sales-presentations/PresentationSections';
import { PresentationDisplaySettings, CardColumn, DialogColumn, PresentationViewMode, PresentationFeatures, CardGridLayout } from '@/types/salesPresentation';

// Default values for display settings
const defaultCardColumns: CardColumn[] = ['price', 'isbn13', 'publisher'];
const defaultDialogColumns: DialogColumn[] = ['price', 'isbn13', 'publisher', 'publication_date', 'synopsis'];
const defaultViewMode: PresentationViewMode = 'card';
const defaultCardGridLayout: CardGridLayout = {
  sm: 1 as const,
  md: 2 as const,
  lg: 3 as const,
  xl: 4 as const,
  xxl: 5 as const
};
const defaultFeatures: PresentationFeatures = {
  enabledViews: ['card', 'table'],
  allowViewToggle: true,
  showProductDetails: true,
  showPricing: true,
  allowDownload: false,
  cardWidthType: 'responsive',
  cardGridLayout: defaultCardGridLayout,
  kanbanGroupByField: 'publisher_name'
};

// Default display settings to ensure type safety
const defaultDisplaySettings: PresentationDisplaySettings = {
  cardColumns: defaultCardColumns,
  dialogColumns: defaultDialogColumns,
  defaultView: defaultViewMode,
  features: defaultFeatures
};

const SalesPresentationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usePresentation, usePublishPresentation } = useSalesPresentations();
  
  const { data: presentation, isLoading, isError } = usePresentation(id);
  const publishMutation = usePublishPresentation();

  const handleEdit = () => {
    navigate(`/sales-presentations/${id}/edit`);
  };

  const handlePublish = async () => {
    if (id) {
      await publishMutation.mutateAsync({ id });
    }
  };
  
  // Log what we got from the API for debugging
  console.log("SalesPresentationDetail - raw presentation data:", presentation?.display_settings);

  if (isLoading) {
    return <div>Loading presentation...</div>;
  }

  if (isError || !presentation) {
    return <div>Error loading presentation</div>;
  }

  // If presentation is loaded, use its display settings or fall back to defaults
  const displaySettings = presentation.display_settings || { ...defaultDisplaySettings };
  
  // Process display settings to ensure all required properties are present
  const processedDisplaySettings: PresentationDisplaySettings = {
    cardColumns: Array.isArray(displaySettings.cardColumns) 
      ? displaySettings.cardColumns
      : defaultCardColumns,
    
    dialogColumns: Array.isArray(displaySettings.dialogColumns) 
      ? displaySettings.dialogColumns
      : defaultDialogColumns,
    
    defaultView: displaySettings.defaultView || defaultViewMode,
    
    features: {
      // Start with default features
      ...defaultFeatures,
      // Override with any features from the presentation
      ...(displaySettings.features || {}),
      // Ensure kanbanGroupByField is preserved from the existing settings or use default
      kanbanGroupByField: displaySettings.features?.kanbanGroupByField || defaultFeatures.kanbanGroupByField
    }
  };

  // Log processed display settings for debugging
  console.log("SalesPresentationDetail - processed display settings:", processedDisplaySettings);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/sales-presentations')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{presentation.title}</h1>
        </div>
        <div className="space-x-2">
          <Button onClick={handleEdit} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {presentation.status === 'draft' ? (
            <Button onClick={handlePublish} disabled={publishMutation.isPending}>
              {publishMutation.isPending ? 'Publishing...' : 'Publish'}
            </Button>
          ) : (
            <Button>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Badge className={
          presentation.status === 'published' 
            ? 'bg-green-100 text-green-800' 
            : presentation.status === 'draft'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
        }>
          {presentation.status.charAt(0).toUpperCase() + presentation.status.slice(1)}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Created: {new Date(presentation.created_at).toLocaleDateString()}
        </span>
        {presentation.published_at && (
          <span className="text-sm text-muted-foreground">
            Published: {new Date(presentation.published_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {presentation.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {presentation.description}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <PresentationSections
          presentationId={id!}
          isEditable={presentation.status === 'draft'}
          displaySettings={processedDisplaySettings}
        />
      </div>
    </div>
  );
};

export default SalesPresentationDetail;
