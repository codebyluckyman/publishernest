
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
import { PresentationDisplaySettings, CardColumn, DialogColumn, PresentationViewMode, PresentationFeatures } from '@/types/salesPresentation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const viewModeOptions = [
  { value: 'card', label: 'Card View' },
  { value: 'table', label: 'Table View' },
  { value: 'carousel', label: 'Carousel View' },
  { value: 'kanban', label: 'Kanban View' },
];

const EditSalesPresentation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usePresentation, useUpdatePresentation } = useSalesPresentations();
  
  const { data: presentation, isLoading } = usePresentation(id);
  const updateMutation = useUpdatePresentation();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [defaultView, setDefaultView] = useState<PresentationViewMode>('card');
  const [enabledViews, setEnabledViews] = useState<PresentationViewMode[]>(['card', 'table']);
  const [allowViewToggle, setAllowViewToggle] = useState(true);
  const [showProductDetails, setShowProductDetails] = useState(true);
  const [showPricing, setShowPricing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (presentation) {
      setTitle(presentation.title);
      setDescription(presentation.description || '');
      
      const features = presentation.display_settings?.features;
      setDefaultView(presentation.display_settings?.defaultView || 'card');
      
      if (features) {
        // Set enabled views if available
        if (Array.isArray(features.enabledViews) && features.enabledViews.length > 0) {
          setEnabledViews(features.enabledViews);
        }
        
        // Set feature flags if available
        setAllowViewToggle(features.allowViewToggle !== false);
        setShowProductDetails(features.showProductDetails !== false);
        setShowPricing(features.showPricing !== false);
      }
    }
  }, [presentation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    try {
      setError(null);
      
      // Make sure defaultView is in enabledViews
      const finalDefaultView = enabledViews.includes(defaultView) ? defaultView : enabledViews[0];
      
      // Construct features object
      const features: PresentationFeatures = {
        enabledViews,
        allowViewToggle,
        showProductDetails,
        showPricing,
        // Include existing features we don't explicitly manage
        ...(presentation?.display_settings?.features?.allowDownload !== undefined && {
          allowDownload: presentation?.display_settings?.features?.allowDownload
        }),
        ...(presentation?.display_settings?.features?.customCss && {
          customCss: presentation?.display_settings?.features?.customCss
        })
      };
      
      // Get current cardColumns and dialogColumns or use defaults
      const currentDisplaySettings = presentation?.display_settings || {};
      const cardColumns = Array.isArray(currentDisplaySettings.cardColumns) 
        ? currentDisplaySettings.cardColumns 
        : ['price', 'isbn13', 'publisher'] as CardColumn[];
      
      const dialogColumns = Array.isArray(currentDisplaySettings.dialogColumns) 
        ? currentDisplaySettings.dialogColumns 
        : ['price', 'isbn13', 'publisher', 'publication_date', 'synopsis'] as DialogColumn[];
      
      // Construct display settings object with required properties
      const displaySettings: PresentationDisplaySettings = {
        cardColumns,
        dialogColumns,
        defaultView: finalDefaultView,
        features
      };
      
      // Log what we're about to save
      console.log("Saving display settings:", displaySettings);
      
      await updateMutation.mutateAsync({
        id,
        title,
        description,
        displaySettings
      });
      
      navigate(`/sales-presentations/${id}`);
    } catch (err) {
      setError('Failed to update presentation');
      console.error(err);
    }
  };

  const toggleEnabledView = (view: PresentationViewMode) => {
    if (enabledViews.includes(view)) {
      // Don't allow removing the last enabled view
      if (enabledViews.length > 1) {
        setEnabledViews(enabledViews.filter(v => v !== view));
      }
    } else {
      setEnabledViews([...enabledViews, view]);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!presentation) {
    return <div>Presentation not found</div>;
  }

  // Default display settings to ensure type safety
  const defaultDisplaySettings: PresentationDisplaySettings = {
    cardColumns: ['price', 'isbn13', 'publisher'] as CardColumn[],
    dialogColumns: ['price', 'isbn13', 'publisher', 'publication_date', 'synopsis'] as DialogColumn[],
    defaultView: 'card',
    features: {
      enabledViews: ['card', 'table'],
      allowViewToggle: true,
      showProductDetails: true,
      showPricing: true
    }
  };

  // Process display settings for backward compatibility
  const displaySettings = presentation.display_settings || defaultDisplaySettings;
  
  // Create a properly typed displaySettings object
  const processedDisplaySettings: PresentationDisplaySettings = {
    cardColumns: Array.isArray(displaySettings.cardColumns) 
      ? displaySettings.cardColumns 
      : (Array.isArray(displaySettings.displayColumns) 
          ? displaySettings.displayColumns 
          : defaultDisplaySettings.cardColumns),
    dialogColumns: Array.isArray(displaySettings.dialogColumns) 
      ? displaySettings.dialogColumns 
      : (Array.isArray(displaySettings.displayColumns) 
          ? [...displaySettings.displayColumns, 'synopsis'] 
          : defaultDisplaySettings.dialogColumns),
    defaultView: displaySettings.defaultView || defaultDisplaySettings.defaultView,
    features: {
      ...defaultDisplaySettings.features,
      ...(displaySettings.features || {})
    }
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
            <div className="space-y-2">
              <Label htmlFor="defaultView">Default View</Label>
              <Select 
                value={defaultView} 
                onValueChange={(value) => setDefaultView(value as PresentationViewMode)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default view" />
                </SelectTrigger>
                <SelectContent>
                  {viewModeOptions
                    .filter(option => enabledViews.includes(option.value as PresentationViewMode))
                    .map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose how products will be displayed by default in the presentation
              </p>
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">View Options</h3>
              
              <div className="space-y-4">
                <div className="text-sm font-medium mb-2">Enabled Views:</div>
                <div className="flex flex-wrap gap-2">
                  {viewModeOptions.map(option => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={enabledViews.includes(option.value as PresentationViewMode) ? "default" : "outline"}
                      className="text-sm"
                      onClick={() => toggleEnabledView(option.value as PresentationViewMode)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Select which view options will be available in the presentation
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowViewToggle">Allow View Switching</Label>
                  <Switch 
                    id="allowViewToggle"
                    checked={allowViewToggle}
                    onCheckedChange={setAllowViewToggle}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  If enabled, users can switch between available views
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showProductDetails">Show Product Details</Label>
                  <Switch 
                    id="showProductDetails"
                    checked={showProductDetails}
                    onCheckedChange={setShowProductDetails}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Allow users to click on products to see details
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showPricing">Show Pricing</Label>
                  <Switch 
                    id="showPricing"
                    checked={showPricing}
                    onCheckedChange={setShowPricing}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Display product pricing information
                </p>
              </div>
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
