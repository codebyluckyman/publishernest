
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { CarouselSettings } from '@/types/salesPresentation';

interface CarouselSettingsTabProps {
  carouselSettings: CarouselSettings;
  onSettingsChange: (settings: CarouselSettings) => void;
}

export function CarouselSettingsTab({ carouselSettings, onSettingsChange }: CarouselSettingsTabProps) {
  // Initialize with provided settings or defaults
  const [settings, setSettings] = useState<CarouselSettings>({
    slidesPerView: carouselSettings?.slidesPerView || { sm: 1, md: 2, lg: 3 },
    autoplay: carouselSettings?.autoplay || false,
    autoplayDelay: carouselSettings?.autoplayDelay || 3000,
    slideHeight: carouselSettings?.slideHeight || 192, // Default to current height (48px * 4)
    showIndicators: carouselSettings?.showIndicators !== false,
  });

  // Update settings and propagate changes to parent
  const updateSettings = (newSettings: Partial<CarouselSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  };

  // Update local state when props change
  useEffect(() => {
    setSettings({
      slidesPerView: carouselSettings?.slidesPerView || { sm: 1, md: 2, lg: 3 },
      autoplay: carouselSettings?.autoplay || false,
      autoplayDelay: carouselSettings?.autoplayDelay || 3000,
      slideHeight: carouselSettings?.slideHeight || 192,
      showIndicators: carouselSettings?.showIndicators !== false,
    });
  }, [carouselSettings]);

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium">Carousel Display Options</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="slides-sm">Small Screens (Mobile)</Label>
            <Select
              value={settings.slidesPerView?.sm?.toString()}
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slides-md">Medium Screens (Tablet)</Label>
            <Select
              value={settings.slidesPerView?.md?.toString()}
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slides-lg">Large Screens (Desktop)</Label>
            <Select
              value={settings.slidesPerView?.lg?.toString()}
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
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="slide-height">Image Height (pixels)</Label>
          <Input
            id="slide-height"
            type="number"
            min={80}
            max={600}
            value={settings.slideHeight}
            onChange={(e) => updateSettings({ slideHeight: parseInt(e.target.value) })}
          />
          <p className="text-sm text-muted-foreground">
            Height of the image area in each carousel slide
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="autoplay">Auto-play Slides</Label>
          <Switch
            id="autoplay"
            checked={settings.autoplay || false}
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
          <Label htmlFor="show-indicators">Show Slide Indicators</Label>
          <Switch
            id="show-indicators"
            checked={settings.showIndicators !== false}
            onCheckedChange={(checked) => updateSettings({ showIndicators: checked })}
          />
        </div>
      </div>
      
      {/* Carousel Preview */}
      <div className="mt-6 border-t pt-4">
        <h4 className="text-sm font-medium mb-2">Preview</h4>
        <div className="bg-muted/30 border rounded-lg p-4">
          <div className="relative">
            <div className="flex space-x-4 overflow-hidden">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  style={{ 
                    height: `${settings.slideHeight}px`,
                    width: "240px",
                    flexShrink: 0,
                  }}
                  className="bg-muted border rounded flex items-center justify-center"
                >
                  <span className="text-sm text-muted-foreground">Slide {num}</span>
                </div>
              ))}
            </div>
            
            {settings.showIndicators && (
              <div className="flex justify-center mt-2 space-x-1">
                {[1, 2, 3].map((num) => (
                  <div 
                    key={num} 
                    className={`h-1.5 rounded-full ${num === 1 ? 'bg-primary w-4' : 'bg-muted w-1.5'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
