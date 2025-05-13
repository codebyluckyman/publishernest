
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
import { CardGridLayout, PresentationDisplaySettings, CardColumn, DialogColumn, PresentationViewMode, PresentationFeatures } from '@/types/salesPresentation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [activeTab, setActiveTab] = useState('view-options');
  const [error, setError] = useState<string | null>(null);

  // Card grid layout state
  const [cardGridLayout, setCardGridLayout] = useState<CardGridLayout>({
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    xxl: 5
  });

  useEffect(() => {
    if (presentation) {
      setTitle(presentation.title);
      setDescription(presentation.description || '');
      
      // Initialize display settings
      const displaySettings = presentation.display_settings || {};
      setDefaultView(displaySettings.defaultView || 'card');
      
      // Initialize card columns with defaults if not available
      const cardColumns = Array.isArray(displaySettings.cardColumns) 
        ? displaySettings.cardColumns 
        : ['price', 'isbn13', 'publisher'];
      
      // Initialize dialog columns with defaults if not available
      const dialogColumns = Array.isArray(displaySettings.dialogColumns) 
        ? displaySettings.dialogColumns 
        : ['price', 'isbn13', 'publisher', 'publication_date', 'synopsis'];
      
      const features = displaySettings.features;
      
      if (features) {
        // Set enabled views if available
        if (Array.isArray(features.enabledViews) && features.enabledViews.length > 0) {
          setEnabledViews(features.enabledViews);
        }
        
        // Set feature flags if available
        setAllowViewToggle(features.allowViewToggle !== false);
        setShowProductDetails(features.showProductDetails !== false);
        setShowPricing(features.showPricing !== false);
        
        // Set card grid layout if available
        if (features.cardGridLayout) {
          setCardGridLayout({
            sm: features.cardGridLayout.sm || 1,
            md: features.cardGridLayout.md || 2,
            lg: features.cardGridLayout.lg || 3,
            xl: features.cardGridLayout.xl || 4,
            xxl: features.cardGridLayout.xxl || 5
          });
        }
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
        cardGridLayout,
        // Include existing features we don't explicitly manage
        ...(presentation?.display_settings?.features?.allowDownload !== undefined && {
          allowDownload: presentation.display_settings.features.allowDownload
        }),
        ...(presentation?.display_settings?.features?.customCss && {
          customCss: presentation.display_settings.features.customCss
        })
      };
      
      // Get current cardColumns and dialogColumns or use defaults
      const currentDisplaySettings = presentation?.display_settings || {};
      const defaultCardColumns: CardColumn[] = ['price', 'isbn13', 'publisher']; 
      const defaultDialogColumns: DialogColumn[] = ['price', 'isbn13', 'publisher', 'publication_date', 'synopsis']; 
      
      const cardColumns = Array.isArray(currentDisplaySettings.cardColumns) 
        ? currentDisplaySettings.cardColumns 
        : defaultCardColumns;
      
      const dialogColumns = Array.isArray(currentDisplaySettings.dialogColumns) 
        ? currentDisplaySettings.dialogColumns 
        : defaultDialogColumns;
      
      // Construct display settings object with required properties
      const updatedDisplaySettings: PresentationDisplaySettings = {
        cardColumns,
        dialogColumns,
        defaultView: finalDefaultView,
        features
      };
      
      // Log what we're about to save
      console.log("Saving display settings:", updatedDisplaySettings);
      
      await updateMutation.mutateAsync({
        id,
        title,
        description,
        displaySettings: updatedDisplaySettings
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

  const handleCardGridChange = (size: keyof CardGridLayout, value: number) => {
    setCardGridLayout(prev => ({
      ...prev,
      [size]: value
    }));
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
      : defaultDisplaySettings.cardColumns,
    dialogColumns: Array.isArray(displaySettings.dialogColumns) 
      ? displaySettings.dialogColumns 
      : defaultDisplaySettings.dialogColumns,
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
              <h3 className="text-lg font-medium">Display Options</h3>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="view-options">View Options</TabsTrigger>
                  <TabsTrigger value="card-layout">Card Layout</TabsTrigger>
                </TabsList>
                
                <TabsContent value="view-options" className="space-y-4 pt-4">
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
                </TabsContent>
                
                <TabsContent value="card-layout" className="space-y-6 pt-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Configure how many cards appear per row at different screen sizes
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sm-columns">Small screens (≤640px)</Label>
                      <Select
                        value={cardGridLayout.sm?.toString()}
                        onValueChange={(value) => handleCardGridChange('sm', parseInt(value))}
                      >
                        <SelectTrigger id="sm-columns">
                          <SelectValue placeholder="Number of columns" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 column</SelectItem>
                          <SelectItem value="2">2 columns</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Mobile devices</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="md-columns">Medium screens (≥768px)</Label>
                      <Select
                        value={cardGridLayout.md?.toString()}
                        onValueChange={(value) => handleCardGridChange('md', parseInt(value))}
                      >
                        <SelectTrigger id="md-columns">
                          <SelectValue placeholder="Number of columns" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 column</SelectItem>
                          <SelectItem value="2">2 columns</SelectItem>
                          <SelectItem value="3">3 columns</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Tablets</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lg-columns">Large screens (≥1024px)</Label>
                      <Select
                        value={cardGridLayout.lg?.toString()}
                        onValueChange={(value) => handleCardGridChange('lg', parseInt(value))}
                      >
                        <SelectTrigger id="lg-columns">
                          <SelectValue placeholder="Number of columns" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 columns</SelectItem>
                          <SelectItem value="3">3 columns</SelectItem>
                          <SelectItem value="4">4 columns</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Laptops</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="xl-columns">X-Large screens (≥1280px)</Label>
                      <Select
                        value={cardGridLayout.xl?.toString()}
                        onValueChange={(value) => handleCardGridChange('xl', parseInt(value))}
                      >
                        <SelectTrigger id="xl-columns">
                          <SelectValue placeholder="Number of columns" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 columns</SelectItem>
                          <SelectItem value="4">4 columns</SelectItem>
                          <SelectItem value="5">5 columns</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Desktops</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="xxl-columns">XX-Large screens (≥1536px)</Label>
                      <Select
                        value={cardGridLayout.xxl?.toString()}
                        onValueChange={(value) => handleCardGridChange('xxl', parseInt(value))}
                      >
                        <SelectTrigger id="xxl-columns">
                          <SelectValue placeholder="Number of columns" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">4 columns</SelectItem>
                          <SelectItem value="5">5 columns</SelectItem>
                          <SelectItem value="6">6 columns</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Large desktops</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 mt-4 border-t">
                    <p className="text-sm font-medium">Preview</p>
                    <div className="mt-2 p-4 bg-muted/30 border rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} className="bg-muted h-16 rounded flex items-center justify-center text-xs text-muted-foreground">
                            Card {i + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Resize your browser to see how the grid adapts to different screen sizes
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
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
