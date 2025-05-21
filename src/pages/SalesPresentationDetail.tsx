import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSalesPresentations } from '@/hooks/useSalesPresentations';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PresentationSections } from '@/components/sales-presentations/PresentationSections';
import { PresentationDisplaySettings, CardColumn, DialogColumn, PresentationViewMode, PresentationFeatures, CardGridLayout, CarouselSettings } from '@/types/salesPresentation';
import { ShareDialog } from '@/components/sales-presentations/ShareDialog';
import { toast } from 'sonner';
import { createPresentationShare } from '@/api/salesPresentations/createPresentationShare';
import { supabaseCustom } from '@/integrations/supabase/client-custom';

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

// Default carousel settings
const defaultCarouselSettings: CarouselSettings = {
  slidesPerView: { sm: 1, md: 2, lg: 3 },
  autoplay: false,
  autoplayDelay: 3000,
  slideHeight: 192,
  showIndicators: true,
  cardLayout: 'standard',
  layoutOptions: {
    showCover: true,
    showSynopsis: true,
    showSpecsTable: true,
    imageSide: 'left',
    includeTableBorders: true,
    alternateRowColors: false,
  },
  sectionStyles: {
    useBorders: true,
    headerBackground: 'bg-gray-50',
    sectionPadding: 4,
  }
};

// Default features
const defaultFeatures: PresentationFeatures = {
  enabledViews: ['card', 'table'],
  allowViewToggle: true,
  showProductDetails: true,
  showPricing: true,
  allowDownload: false,
  cardWidthType: 'responsive',
  cardGridLayout: defaultCardGridLayout,
  carouselSettings: defaultCarouselSettings,
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

  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleEdit = () => {
    navigate(`/sales-presentations/${id}/edit`);
  };

  const handlePublish = async () => {
    if (id) {
      await publishMutation.mutateAsync({ id });
    }
  };
  
  // Handle sharing the presentation
  const handleShare = () => {
    setShareDialogOpen(true);
    setShareLink(null); // Reset any previous link
  };

  // Create share link
  const confirmShare = async (recipientEmail?: string) => {
    if (!id) return;
    
    setIsSharing(true);
    try {
      const currentUser = await supabaseCustom.auth.getUser();
      const userId = currentUser.data.user?.id;
      
      if (!userId) {
        toast.error('You must be logged in to share presentations');
        return;
      }
      
      let expiresAt: string | undefined = undefined;
      if (recipientEmail) {
        // Set expiration 30 days from now if sending to specific recipient
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + 30);
        expiresAt = expiration.toISOString();
      }
      
      const link = await createPresentationShare({
        presentationId: id,
        sharedBy: userId,
        sharedWith: recipientEmail,
        expiresAt
      });
      
      if (link) {
        setShareLink(link);
        // Only show toast if sharing without dialog
        if (!shareDialogOpen) {
          toast.success('Share link created successfully');
        }
      } else {
        toast.error('Failed to create share link');
      }
    } catch (error) {
      console.error('Error creating share link:', error);
      toast.error('Failed to create share link');
    } finally {
      setIsSharing(false);
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
      // Ensure carouselSettings is preserved or use default
      carouselSettings: displaySettings.features?.carouselSettings || defaultCarouselSettings,
      // Ensure kanbanGroupByField is preserved or use default
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
            <Button onClick={handleShare}>
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
      
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        onShare={confirmShare}
        shareLink={shareLink}
        isSharing={isSharing}
      />
    </div>
  );
};

export default SalesPresentationDetail;
