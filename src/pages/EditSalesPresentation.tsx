
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
import { 
  CardGridLayout, 
  PresentationDisplaySettings, 
  CardColumn, 
  DialogColumn, 
  PresentationViewMode, 
  PresentationFeatures, 
  CardWidthType,
  CarouselSettings
} from '@/types/salesPresentation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { EditProductFieldsTab } from '@/components/sales-presentations/EditProductFieldsTab';
import { CarouselSettingsTab } from '@/components/sales-presentations/CarouselSettingsTab';

const viewModeOptions = [
  { value: 'card', label: 'Card View' },
  { value: 'table', label: 'Table View' },
  { value: 'carousel', label: 'Carousel View' },
  { value: 'kanban', label: 'Kanban View' },
];

// Define the group by options for the kanban view
const kanbanGroupByOptions = [
  { value: 'publisher_name', label: 'Publisher' },
  { value: 'format', label: 'Format' },
  { value: 'product_form', label: 'Format Type' },
  { value: 'age_range', label: 'Age Range' },
  { value: 'publication_date', label: 'Publication Year' },
  { value: 'publication_month_year', label: 'Publication Month' },
  { value: 'status', label: 'Status' }
];

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
  slideHeight: 192,  // 192px default height
  showIndicators: true
};

const defaultFeatures: PresentationFeatures = {
  enabledViews: ['card', 'table'],
  allowViewToggle: true,
  showProductDetails: true,
  showPricing: true,
  allowDownload: false,
  cardWidthType: 'responsive',
  cardGridLayout: defaultCardGridLayout,
  carouselSettings: defaultCarouselSettings
};

const defaultDisplaySettings: PresentationDisplaySettings = {
  cardColumns: defaultCardColumns,
  dialogColumns: defaultDialogColumns,
  defaultView: defaultViewMode,
  features: defaultFeatures
};

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
  const [cardWidthType, setCardWidthType] = useState<CardWidthType>('responsive');
  const [fixedCardWidth, setFixedCardWidth] = useState<number>(320);
  const [kanbanGroupByField, setKanbanGroupByField] = useState<string>('publisher_name');
  const [carouselSettings, setCarouselSettings] = useState<CarouselSettings>(defaultCarouselSettings);

  // Card grid layout state
  const [cardGridLayout, setCardGridLayout] = useState<CardGridLayout>(defaultCardGridLayout);
  
  // Product fields state
  const [cardColumns, setCardColumns] = useState<CardColumn[]>(defaultCardColumns);
  const [dialogColumns, setDialogColumns] = useState<DialogColumn[]>(defaultDialogColumns);

  useEffect(() => {
    if (presentation) {
      // Set basic fields
      setTitle(presentation.title);
      setDescription(presentation.description || '');
      
      console.log("EditSalesPresentation - Raw presentation data:", presentation);
      console.log("EditSalesPresentation - Raw display settings:", presentation.display_settings);
      
      // Initialize display settings with complete defaults
      const displaySettings = presentation.display_settings || { ...defaultDisplaySettings };
      
      // Set default view
      setDefaultView(displaySettings.defaultView || defaultViewMode);
      
      // Set product columns
      setCardColumns(
        Array.isArray(displaySettings.cardColumns) && displaySettings.cardColumns.length > 0
          ? displaySettings.cardColumns
          : defaultCardColumns
      );
      
      setDialogColumns(
        Array.isArray(displaySettings.dialogColumns) && displaySettings.dialogColumns.length > 0
          ? displaySettings.dialogColumns
          : defaultDialogColumns
      );
      
      // Initialize features with defaults
      const features = displaySettings.features || { ...defaultFeatures };
      
      console.log("EditSalesPresentation - Features from DB:", features);
      
      // Set enabled views if available
      if (Array.isArray(features.enabledViews) && features.enabledViews.length > 0) {
        setEnabledViews(features.enabledViews);
      } else {
        setEnabledViews(defaultFeatures.enabledViews);
      }
      
      // Set feature flags with defaults if not available
      setAllowViewToggle(features.allowViewToggle !== false);
      setShowProductDetails(features.showProductDetails !== false);
      setShowPricing(features.showPricing !== false);
      
      // Set card width settings with defaults if not available
      setCardWidthType(features.cardWidthType || defaultFeatures.cardWidthType);
      setFixedCardWidth(features.fixedCardWidth || 320);
      
      // Set card grid layout with defaults if not available
      if (features.cardGridLayout) {
        console.log("EditSalesPresentation - Card grid layout from DB:", features.cardGridLayout);
        
        const gridLayout: CardGridLayout = {
          sm: (features.cardGridLayout.sm as 1 | 2) || defaultCardGridLayout.sm,
          md: (features.cardGridLayout.md as 1 | 2 | 3) || defaultCardGridLayout.md,
          lg: (features.cardGridLayout.lg as 2 | 3 | 4) || defaultCardGridLayout.lg,
          xl: (features.cardGridLayout.xl as 3 | 4 | 5) || defaultCardGridLayout.xl,
          xxl: (features.cardGridLayout.xxl as 4 | 5 | 6) || defaultCardGridLayout.xxl
        };
        
        console.log("EditSalesPresentation - Processed grid layout:", gridLayout);
        setCardGridLayout(gridLayout);
      } else {
        console.log("EditSalesPresentation - Using default grid layout");
        setCardGridLayout(defaultCardGridLayout);
      }
      
      // Set kanban group by field if available
      setKanbanGroupByField(features.kanbanGroupByField || 'publisher_name');

      // Set carousel settings if available
      if (features.carouselSettings) {
        console.log("EditSalesPresentation - Carousel settings from DB:", features.carouselSettings);
        setCarouselSettings({
          ...defaultCarouselSettings,
          ...features.carouselSettings
        });
      } else {
        setCarouselSettings(defaultCarouselSettings);
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
        cardWidthType,
        cardGridLayout,
        kanbanGroupByField,
        carouselSettings,
        // Include existing features we don't explicitly manage
        ...(presentation?.display_settings?.features?.allowDownload !== undefined && {
          allowDownload: presentation.display_settings.features.allowDownload
        }),
        ...(presentation?.display_settings?.features?.customCss && {
          customCss: presentation.display_settings.features.customCss
        })
      };

      // Only include fixedCardWidth if card width type is fixed
      if (cardWidthType === 'fixed') {
        features.fixedCardWidth = fixedCardWidth;
      }
      
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
    setCardGridLayout(prev => {
      const updatedLayout = { ...prev };
      
      // Type assertion to ensure we're setting valid values for each breakpoint
      if (size === 'sm') updatedLayout[size] = value as 1 | 2;
      else if (size === 'md') updatedLayout[size] = value as 1 | 2 | 3;
      else if (size === 'lg') updatedLayout[size] = value as 2 | 3 | 4;
      else if (size === 'xl') updatedLayout[size] = value as 3 | 4 | 5;
      else if (size === 'xxl') updatedLayout[size] = value as 4 | 5 | 6;
      
      console.log("EditSalesPresentation - Grid layout updated:", updatedLayout);
      return updatedLayout;
    });
  };

  const handleCardWidthTypeChange = (value: CardWidthType) => {
    setCardWidthType(value);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!presentation) {
    return <div>Presentation not found</div>;
  }

  // Process display settings for backward compatibility
  const displaySettings = presentation.display_settings || { ...defaultDisplaySettings };
  
  // Create a properly typed displaySettings object
  const processedDisplaySettings: PresentationDisplaySettings = {
    cardColumns: Array.isArray(displaySettings.cardColumns) 
      ? displaySettings.cardColumns 
      : defaultCardColumns,
    dialogColumns: Array.isArray(displaySettings.dialogColumns) 
      ? displaySettings.dialogColumns 
      : defaultDialogColumns,
    defaultView: displaySettings.defaultView || defaultViewMode,
    features: {
      ...defaultFeatures,
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
                <TabsList className="grid grid-cols-5">
                  <TabsTrigger value="view-options">View Options</TabsTrigger>
                  <TabsTrigger value="product-fields">Product Fields</TabsTrigger>
                  <TabsTrigger value="card-layout">Card Layout</TabsTrigger>
                  <TabsTrigger value="carousel-layout">Carousel Layout</TabsTrigger>
                  <TabsTrigger value="kanban-layout">Kanban Layout</TabsTrigger>
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
                
                <TabsContent value="product-fields">
                  <EditProductFieldsTab
                    cardColumns={cardColumns}
                    setCardColumns={setCardColumns}
                    dialogColumns={dialogColumns}
                    setDialogColumns={setDialogColumns}
                  />
                </TabsContent>
                
                <TabsContent value="card-layout" className="space-y-6 pt-4">
                  {/* Card Width Type Selection */}
                  <div className="space-y-3">
                    <Label>Card Width Type</Label>
                    <RadioGroup
                      value={cardWidthType}
                      onValueChange={(value) => handleCardWidthTypeChange(value as CardWidthType)}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="responsive" id="responsive-width" />
                        <Label htmlFor="responsive-width" className="font-normal">
                          Responsive (adapts to screen size)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="fixed" id="fixed-width" />
                        <Label htmlFor="fixed-width" className="font-normal">
                          Fixed Width (specify exact width)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Fixed Card Width Input - Only shown when fixed width is selected */}
                  {cardWidthType === 'fixed' && (
                    <div className="space-y-2">
                      <Label htmlFor="fixedCardWidth">Card Width (pixels)</Label>
                      <Input
                        id="fixedCardWidth"
                        type="number"
                        min={200}
                        max={800}
                        value={fixedCardWidth}
                        onChange={(e) => setFixedCardWidth(Number(e.target.value))}
                        placeholder="320"
                      />
                      <p className="text-sm text-muted-foreground">
                        Recommended: 300-500 pixels. Cards will have exactly this width.
                      </p>
                    </div>
                  )}
                  
                  {/* Only show grid layout controls for responsive mode */}
                  {cardWidthType === 'responsive' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="sm-columns">Small screens (≤640px)</Label>
                        <Select
                          value={cardGridLayout.sm?.toString()}
                          onValueChange={(value) => {
                            const numValue = parseInt(value);
                            handleCardGridChange('sm', numValue as 1 | 2);
                          }}
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
                          onValueChange={(value) => {
                            const numValue = parseInt(value);
                            handleCardGridChange('md', numValue as 1 | 2 | 3);
                          }}
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
                          onValueChange={(value) => {
                            const numValue = parseInt(value);
                            handleCardGridChange('lg', numValue as 2 | 3 | 4);
                          }}
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
                          onValueChange={(value) => {
                            const numValue = parseInt(value);
                            handleCardGridChange('xl', numValue as 3 | 4 | 5);
                          }}
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
                          onValueChange={(value) => {
                            const numValue = parseInt(value);
                            handleCardGridChange('xxl', numValue as 4 | 5 | 6);
                          }}
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
                  )}
                  
                  {/* Preview section - shows for both fixed and responsive modes */}
                  <div className="pt-2 mt-4 border-t">
                    <p className="text-sm font-medium">Preview</p>
                    <div className="mt-2 p-4 bg-muted/30 border rounded-lg">
                      {cardWidthType === 'fixed' ? (
                        <div className="flex flex-wrap gap-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div 
                              key={i} 
                              className="bg-muted h-16 rounded flex items-center justify-center text-xs text-muted-foreground"
                              style={{ 
                                width: `${fixedCardWidth}px`,
                                flexShrink: 0
                              }}
                            >
                              Fixed width: {fixedCardWidth}px
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="bg-muted h-16 rounded flex items-center justify-center text-xs text-muted-foreground">
                              Card {i + 1}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Resize your browser to see how the grid adapts to different screen sizes
                    </p>
                  </div>
                </TabsContent>
                
                {/* New Tab for Carousel Layout Settings */}
                <TabsContent value="carousel-layout" className="space-y-6 pt-4">
                  <CarouselSettingsTab
                    carouselSettings={carouselSettings}
                    onSettingsChange={setCarouselSettings}
                  />
                </TabsContent>
                
                <TabsContent value="kanban-layout" className="space-y-6 pt-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Kanban Grouping</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose how products will be grouped in the Kanban view
                    </p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="kanbanGroupBy">Group products by</Label>
                      <Select
                        value={kanbanGroupByField}
                        onValueChange={(value) => setKanbanGroupByField(value)}
                      >
                        <SelectTrigger id="kanbanGroupBy" className="w-full">
                          <SelectValue placeholder="Select grouping field" />
                        </SelectTrigger>
                        <SelectContent>
                          {kanbanGroupByOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Products will be grouped by the selected field in the Kanban view
                      </p>
                    </div>
                    
                    {/* Kanban Preview */}
                    <div className="pt-6 mt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Preview</h4>
                      <div className="bg-muted/30 border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {['Group 1', 'Group 2'].map((group) => (
                            <div key={group} className="border rounded-md p-3">
                              <h3 className="text-sm font-medium mb-2 border-b pb-1">
                                {kanbanGroupByOptions.find(opt => opt.value === kanbanGroupByField)?.label}: {group}
                              </h3>
                              <div className="space-y-2">
                                {[1, 2].map((item) => (
                                  <div key={item} className="bg-background border rounded p-2 text-xs">
                                    Product {group}-{item}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        This is how products will be grouped in the Kanban view
                      </p>
                    </div>
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
