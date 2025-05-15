
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CarouselSettings } from '@/types/salesPresentation';

interface CarouselSettingsTabProps {
  carouselSettings: CarouselSettings;
  onSettingsChange: (settings: CarouselSettings) => void;
}

export function CarouselSettingsTab({ carouselSettings, onSettingsChange }: CarouselSettingsTabProps) {
  // Ensure we have default values for all settings
  const settings = {
    slidesPerView: carouselSettings.slidesPerView || { sm: 1, md: 2, lg: 3 },
    autoplay: typeof carouselSettings.autoplay === 'boolean' ? carouselSettings.autoplay : false,
    autoplayDelay: carouselSettings.autoplayDelay || 3000,
    slideHeight: carouselSettings.slideHeight || 192,
    showIndicators: typeof carouselSettings.showIndicators === 'boolean' ? carouselSettings.showIndicators : true,
    cardLayout: carouselSettings.cardLayout || 'standard',
    layoutOptions: carouselSettings.layoutOptions || {
      showCover: true,
      showSynopsis: true,
      showSpecsTable: true,
      imageSide: 'left',
      coverToDescriptionRatio: 0.4,
      includeTableBorders: true,
      alternateRowColors: false,
    },
    sectionStyles: carouselSettings.sectionStyles || {
      useBorders: true,
      borderColor: 'border-gray-200',
      headerBackground: 'bg-gray-50',
      sectionPadding: 4,
    }
  };

  // Update settings and propagate changes to parent
  const updateSettings = (newSettings: Partial<CarouselSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    onSettingsChange(updatedSettings);
  };

  // Update nested layout options
  const updateLayoutOptions = (newOptions: Partial<CarouselSettings['layoutOptions']>) => {
    updateSettings({
      layoutOptions: {
        ...settings.layoutOptions,
        ...newOptions
      }
    });
  };

  // Update nested section styles
  const updateSectionStyles = (newStyles: Partial<CarouselSettings['sectionStyles']>) => {
    updateSettings({
      sectionStyles: {
        ...settings.sectionStyles,
        ...newStyles
      }
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="slidesPerView">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="slidesPerView">Slides & Display</TabsTrigger>
          <TabsTrigger value="layoutOptions">Layout Options</TabsTrigger>
        </TabsList>
        
        <TabsContent value="slidesPerView" className="space-y-6">
          <h3 className="text-sm font-medium">Carousel Display Options</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slides-sm">Small Screens (Mobile)</Label>
                <Select
                  value={settings.slidesPerView.sm?.toString()}
                  onValueChange={(value) => {
                    const slidesPerView = { 
                      ...settings.slidesPerView, 
                      sm: parseInt(value) as 1 | 2 
                    };
                    updateSettings({ slidesPerView });
                  }}
                >
                  <SelectTrigger id="slides-sm">
                    <SelectValue placeholder="Slides per view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 slide</SelectItem>
                    <SelectItem value="2">2 slides</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">For screens ≤640px</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slides-md">Medium Screens (Tablet)</Label>
                <Select
                  value={settings.slidesPerView.md?.toString()}
                  onValueChange={(value) => {
                    const slidesPerView = { 
                      ...settings.slidesPerView, 
                      md: parseInt(value) as 1 | 2 | 3 
                    };
                    updateSettings({ slidesPerView });
                  }}
                >
                  <SelectTrigger id="slides-md">
                    <SelectValue placeholder="Slides per view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 slide</SelectItem>
                    <SelectItem value="2">2 slides</SelectItem>
                    <SelectItem value="3">3 slides</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">For screens ≥768px</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slides-lg">Large Screens (Desktop)</Label>
                <Select
                  value={settings.slidesPerView.lg?.toString()}
                  onValueChange={(value) => {
                    const slidesPerView = { 
                      ...settings.slidesPerView, 
                      lg: parseInt(value) as 1 | 2 | 3 | 4 
                    };
                    updateSettings({ slidesPerView });
                  }}
                >
                  <SelectTrigger id="slides-lg">
                    <SelectValue placeholder="Slides per view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 slide</SelectItem>
                    <SelectItem value="2">2 slides</SelectItem>
                    <SelectItem value="3">3 slides</SelectItem>
                    <SelectItem value="4">4 slides</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">For screens ≥1024px</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slide-height">Slide Height (pixels)</Label>
              <Input
                id="slide-height"
                type="number"
                min={48}
                max={600}
                value={settings.slideHeight}
                onChange={(e) => updateSettings({ slideHeight: parseInt(e.target.value) })}
              />
              <p className="text-sm text-muted-foreground">
                Height of each card in the carousel
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoplay">Auto-play Slides</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically advance through slides
                </p>
              </div>
              <Switch
                id="autoplay"
                checked={settings.autoplay}
                onCheckedChange={(checked) => updateSettings({ autoplay: checked })}
              />
            </div>
            
            {settings.autoplay && (
              <div className="space-y-2">
                <Label htmlFor="autoplay-delay">Autoplay Delay (ms)</Label>
                <Input
                  id="autoplay-delay"
                  type="number"
                  min={1000}
                  max={10000}
                  step={500}
                  value={settings.autoplayDelay}
                  onChange={(e) => updateSettings({ autoplayDelay: parseInt(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground">
                  Time between slide transitions (in milliseconds)
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-indicators">Show Slide Indicators</Label>
                <p className="text-sm text-muted-foreground">
                  Display dots indicating current slide position
                </p>
              </div>
              <Switch
                id="show-indicators"
                checked={settings.showIndicators}
                onCheckedChange={(checked) => updateSettings({ showIndicators: checked })}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="layoutOptions" className="space-y-6">
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-medium">Card Layout Options</h3>
            
            <div className="space-y-2">
              <Label htmlFor="card-layout">Card Layout</Label>
              <Select
                value={settings.cardLayout || 'standard'}
                onValueChange={(value) => updateSettings({ 
                  cardLayout: value as 'standard' | 'product-sheet'
                })}
              >
                <SelectTrigger id="card-layout">
                  <SelectValue placeholder="Select card layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Card</SelectItem>
                  <SelectItem value="product-sheet">Product Sheet</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose between the standard card or product sheet layout
              </p>
            </div>
            
            {settings.cardLayout === 'product-sheet' && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="text-sm font-medium">Product Sheet Options</h4>
                
                {/* Content sections toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-cover">Show Cover Image</Label>
                    <Switch 
                      id="show-cover"
                      checked={settings.layoutOptions?.showCover !== false}
                      onCheckedChange={(checked) => updateLayoutOptions({ showCover: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-synopsis">Show Synopsis</Label>
                    <Switch 
                      id="show-synopsis"
                      checked={settings.layoutOptions?.showSynopsis !== false}
                      onCheckedChange={(checked) => updateLayoutOptions({ showSynopsis: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-specs">Show Specs Table</Label>
                    <Switch 
                      id="show-specs"
                      checked={settings.layoutOptions?.showSpecsTable !== false}
                      onCheckedChange={(checked) => updateLayoutOptions({ showSpecsTable: checked })}
                    />
                  </div>
                </div>
                
                {/* Image position */}
                {settings.layoutOptions?.showCover && (
                  <div className="space-y-2">
                    <Label htmlFor="image-side">Image Position</Label>
                    <Select
                      value={settings.layoutOptions?.imageSide || 'left'}
                      onValueChange={(value) => updateLayoutOptions({
                        imageSide: value as 'left' | 'right' | 'top'
                      })}
                    >
                      <SelectTrigger id="image-side">
                        <SelectValue placeholder="Image position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left Side</SelectItem>
                        <SelectItem value="right">Right Side</SelectItem>
                        <SelectItem value="top">Top (Above Content)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Table styling options */}
                {settings.layoutOptions?.showSpecsTable && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Table Style</h4>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="table-borders">Include Table Borders</Label>
                      <Switch 
                        id="table-borders"
                        checked={settings.layoutOptions?.includeTableBorders !== false}
                        onCheckedChange={(checked) => updateLayoutOptions({ includeTableBorders: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="alternate-rows">Alternate Row Colors</Label>
                      <Switch 
                        id="alternate-rows"
                        checked={settings.layoutOptions?.alternateRowColors === true}
                        onCheckedChange={(checked) => updateLayoutOptions({ alternateRowColors: checked })}
                      />
                    </div>
                  </div>
                )}
                
                {/* Section styling */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Section Style</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="use-borders">Use Section Borders</Label>
                    <Switch 
                      id="use-borders"
                      checked={settings.sectionStyles?.useBorders !== false}
                      onCheckedChange={(checked) => updateSectionStyles({ useBorders: checked })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Preview for product sheet layout */}
          {settings.cardLayout === 'product-sheet' && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Layout Preview</h4>
              <div className="bg-muted/30 border rounded-lg p-4">
                <div className="bg-card border rounded-md overflow-hidden">
                  {/* Preview header */}
                  <div className={`p-3 ${settings.sectionStyles?.headerBackground || 'bg-gray-50'} ${settings.sectionStyles?.useBorders ? 'border-b' : ''}`}>
                    <h3 className="font-medium">Product Title</h3>
                  </div>
                  
                  {/* Preview content */}
                  <div className={`flex ${settings.layoutOptions?.imageSide === 'top' ? 'flex-col' : ''}`}>
                    {settings.layoutOptions?.showCover && (
                      <div 
                        className={`${settings.layoutOptions?.imageSide === 'top' ? 'w-full' : 
                        settings.layoutOptions?.imageSide === 'left' ? 'w-2/5' : 'w-2/5 order-2'} 
                        ${settings.sectionStyles?.useBorders ? 'border-r' : ''} p-3`}
                      >
                        <div className="bg-muted h-24 flex items-center justify-center text-xs text-muted-foreground">
                          Cover Image
                        </div>
                      </div>
                    )}
                    
                    {settings.layoutOptions?.showSynopsis && (
                      <div 
                        className={`${settings.layoutOptions?.imageSide === 'top' ? 'w-full' : 'w-3/5'} p-3`}
                      >
                        <h4 className="text-sm font-medium mb-1">Synopsis</h4>
                        <div className="text-xs text-muted-foreground">Product description...</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Preview specs table */}
                  {settings.layoutOptions?.showSpecsTable && (
                    <div className={`p-3 ${settings.sectionStyles?.useBorders ? 'border-t' : ''}`}>
                      <div className={`grid grid-cols-2 gap-2 ${settings.layoutOptions?.includeTableBorders ? 'border rounded' : ''}`}>
                        {[1, 2, 3].map(i => (
                          <div 
                            key={i} 
                            className={`grid grid-cols-2 text-xs
                              ${settings.layoutOptions?.includeTableBorders ? 'border-b last:border-b-0' : ''}
                              ${settings.layoutOptions?.alternateRowColors && i % 2 === 0 ? 'bg-muted/30' : ''}
                            `}
                          >
                            <div className={`p-2 font-medium ${settings.layoutOptions?.includeTableBorders ? 'border-r' : ''}`}>Field {i}:</div>
                            <div className="p-2">Value {i}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This is a simplified preview of how the product sheet layout will appear
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
