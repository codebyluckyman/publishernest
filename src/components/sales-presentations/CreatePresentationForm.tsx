
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardColumn, DialogColumn, PresentationViewMode, CardWidthType } from '@/types/salesPresentation';
import { EditProductFieldsTab } from './EditProductFieldsTab';

// Define the view mode options for selection
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
  { value: 'status', label: 'Status' }
];

// Default values
const defaultCardColumns: CardColumn[] = ['price', 'isbn13', 'publisher'];
const defaultDialogColumns: DialogColumn[] = ['price', 'isbn13', 'publisher', 'publication_date', 'synopsis'];

type CreatePresentationFormProps = {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
};

export function CreatePresentationForm({ onSubmit, isSubmitting }: CreatePresentationFormProps) {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState('view-options');
  
  // View options
  const [defaultView, setDefaultView] = useState<PresentationViewMode>('card');
  const [enabledViews, setEnabledViews] = useState<PresentationViewMode[]>(['card', 'table']);
  const [allowViewToggle, setAllowViewToggle] = useState(true);
  const [showProductDetails, setShowProductDetails] = useState(true);
  const [showPricing, setShowPricing] = useState(true);
  
  // Card layout options
  const [cardWidthType, setCardWidthType] = useState<CardWidthType>('responsive');
  const [fixedCardWidth, setFixedCardWidth] = useState<number>(320);
  const [cardGridLayout, setCardGridLayout] = useState({
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    xxl: 5
  });

  // Kanban layout options
  const [kanbanGroupByField, setKanbanGroupByField] = useState('publisher_name');
  
  // Product fields
  const [cardColumns, setCardColumns] = useState<CardColumn[]>(defaultCardColumns);
  const [dialogColumns, setDialogColumns] = useState<DialogColumn[]>(defaultDialogColumns);

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

  const handleCardGridChange = (size: string, value: number) => {
    setCardGridLayout((prev: any) => ({
      ...prev,
      [size]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Make sure defaultView is in enabledViews
    const finalDefaultView = enabledViews.includes(defaultView) ? defaultView : enabledViews[0];
    
    onSubmit({
      title,
      description,
      defaultView: finalDefaultView,
      enabledViews,
      allowViewToggle,
      showProductDetails,
      showPricing,
      cardColumns,
      dialogColumns,
      cardWidthType,
      fixedCardWidth,
      cardGridLayout,
      kanbanGroupByField
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Presentation Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter a title for your presentation"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter an optional description"
            className="min-h-32"
          />
        </div>
      </div>
      
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">Display Options</h3>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="view-options">View Options</TabsTrigger>
            <TabsTrigger value="product-fields">Product Fields</TabsTrigger>
            <TabsTrigger value="card-layout">Card Layout</TabsTrigger>
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
                <Label htmlFor="defaultView">Default View</Label>
                <Select 
                  value={defaultView} 
                  onValueChange={(value) => setDefaultView(value as PresentationViewMode)}
                  disabled={enabledViews.length === 0}
                >
                  <SelectTrigger className="w-[180px]">
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
              </div>
              <p className="text-sm text-muted-foreground">
                Choose how products will be displayed by default in the presentation
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
                onValueChange={(value) => setCardWidthType(value as CardWidthType)}
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
            )}
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
                  onValueChange={setKanbanGroupByField}
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
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Presentation'}
        </Button>
      </div>
    </form>
  );
}
