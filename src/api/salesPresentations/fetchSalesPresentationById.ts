import { supabase } from '@/integrations/supabase/client';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { SalesPresentation, PresentationDisplaySettings, CardColumn, DialogColumn, PresentationViewMode, PresentationFeatures, CardWidthType, CardGridLayout, CarouselSettings } from '@/types/salesPresentation';

// Type guard to verify the shape of display_settings for legacy format
function hasDisplayColumns(obj: any): obj is { displayColumns: CardColumn[] } {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.displayColumns)
  );
}

// Type guard for the new format
function hasCardAndDialogColumns(obj: any): obj is PresentationDisplaySettings {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.cardColumns) &&
    Array.isArray(obj.dialogColumns)
  );
}

// Type guard for features object
function hasFeatures(obj: any): obj is { features: PresentationFeatures } {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.features &&
    typeof obj.features === 'object'
  );
}

// Valid column values that can be used - updated to include all possible fields from types
const validCardColumns: CardColumn[] = [
  // Basic info
  'title', 'isbn13', 'isbn10', 'price',
  // Product details
  'product_form', 'product_form_detail', 'publisher', 'publication_date', 'status',
  // Physical properties - individual
  'height', 'width', 'thickness', 'weight',
  // Physical properties - grouped
  'physical_properties',
  // Format details
  'format', 'format_extras', 'format_extra_comments',
  // Format information from formats table
  'format_name', 'binding_type', 'cover_material', 'cover_stock_print',
  'internal_material', 'internal_stock_print', 'orientation', 'extent',
  'tps_dimensions', 'plc_dimensions',
  // Content details
  'page_count', 'edition_number',
  // Carton information - individual
  'carton_quantity', 'carton_dimensions',
  // Additional information
  'synopsis', 'subtitle', 'series_name', 'age_range', 'license',
  // Codes
  'language_code', 'subject_code', 'product_availability_code'
];

const validDialogColumns: DialogColumn[] = [
  // Basic info
  'title', 'isbn13', 'isbn10', 'price',
  // Product details
  'product_form', 'product_form_detail', 'publisher', 'publication_date', 'status',
  // Physical properties - individual
  'height', 'width', 'thickness', 'weight',
  // Physical properties - grouped
  'physical_properties',
  // Format details
  'format', 'format_extras', 'format_extra_comments',
  // Format information from formats table
  'format_name', 'binding_type', 'cover_material', 'cover_stock_print',
  'internal_material', 'internal_stock_print', 'orientation', 'extent',
  'tps_dimensions', 'plc_dimensions',
  // Content details
  'page_count', 'edition_number',
  // Carton information - individual
  'carton_quantity', 'carton_length', 'carton_width', 'carton_height', 'carton_weight',
  // Carton information - grouped
  'carton_dimensions',
  // Additional information
  'synopsis', 'subtitle', 'series_name', 'age_range', 'license',
  // Codes
  'language_code', 'subject_code', 'product_availability_code'
];

const validViewModes: PresentationViewMode[] = ['card', 'table', 'carousel', 'kanban'];

// Default display settings to use if none found or invalid
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

const defaultDisplaySettings: PresentationDisplaySettings = {
  cardColumns: ["price", "isbn13", "publisher", "publication_date"],
  dialogColumns: ["price", "isbn13", "publisher", "publication_date", "synopsis"],
  defaultView: 'card',
  features: {
    enabledViews: ['card', 'table', 'carousel'],
    allowViewToggle: true,
    showProductDetails: true,
    showPricing: true,
    allowDownload: false,
    cardWidthType: 'responsive' as CardWidthType,
    cardGridLayout: defaultCardGridLayout,
    kanbanGroupByField: 'publisher_name',
    carouselSettings: defaultCarouselSettings
  }
};

// Function to sanitize and validate column values
function sanitizeCardColumns(columns: any[]): CardColumn[] {
  if (!Array.isArray(columns)) return defaultDisplaySettings.cardColumns;
  
  console.log('Sanitizing card columns:', columns);
  const sanitizedColumns = columns.filter(col => validCardColumns.includes(col as CardColumn)) as CardColumn[];
  console.log('Sanitized card columns:', sanitizedColumns);
  
  return sanitizedColumns.length > 0 ? sanitizedColumns : defaultDisplaySettings.cardColumns;
}

function sanitizeDialogColumns(columns: any[]): DialogColumn[] {
  if (!Array.isArray(columns)) return defaultDisplaySettings.dialogColumns;
  
  console.log('Sanitizing dialog columns:', columns);
  const sanitizedColumns = columns.filter(col => validDialogColumns.includes(col as DialogColumn)) as DialogColumn[];
  console.log('Sanitized dialog columns:', sanitizedColumns);
  
  return sanitizedColumns.length > 0 ? sanitizedColumns : defaultDisplaySettings.dialogColumns;
}

// Function to validate view mode
function sanitizeViewMode(viewMode: any): PresentationViewMode {
  if (typeof viewMode !== 'string' || !validViewModes.includes(viewMode as PresentationViewMode)) {
    return 'card';
  }
  return viewMode as PresentationViewMode;
}

// Function to validate and normalize a grid layout configuration
function sanitizeCardGridLayout(gridLayout: any): CardGridLayout {
  if (!gridLayout || typeof gridLayout !== 'object') {
    return defaultCardGridLayout;
  }
  
  // Create a valid grid layout object ensuring all values are of the correct type
  const sanitizedLayout: CardGridLayout = {
    sm: typeof gridLayout.sm === 'number' && (gridLayout.sm === 1 || gridLayout.sm === 2) 
      ? gridLayout.sm as 1 | 2 
      : defaultCardGridLayout.sm,
      
    md: typeof gridLayout.md === 'number' && [1, 2, 3].includes(gridLayout.md)
      ? gridLayout.md as 1 | 2 | 3
      : defaultCardGridLayout.md,
      
    lg: typeof gridLayout.lg === 'number' && [2, 3, 4].includes(gridLayout.lg)
      ? gridLayout.lg as 2 | 3 | 4
      : defaultCardGridLayout.lg,
      
    xl: typeof gridLayout.xl === 'number' && [3, 4, 5].includes(gridLayout.xl)
      ? gridLayout.xl as 3 | 4 | 5
      : defaultCardGridLayout.xl,
      
    xxl: typeof gridLayout.xxl === 'number' && [4, 5, 6].includes(gridLayout.xxl)
      ? gridLayout.xxl as 4 | 5 | 6
      : defaultCardGridLayout.xxl
  };
  
  return sanitizedLayout;
}

// Function to sanitize and validate carousel settings
function sanitizeCarouselSettings(carouselSettings: any): CarouselSettings {
  if (!carouselSettings || typeof carouselSettings !== 'object') {
    return defaultCarouselSettings;
  }
  
  // Create a valid carousel settings object ensuring all values are of the correct type
  const sanitizedSettings: CarouselSettings = {
    slidesPerView: {
      sm: typeof carouselSettings.slidesPerView?.sm === 'number' && [1, 2].includes(carouselSettings.slidesPerView.sm)
        ? carouselSettings.slidesPerView.sm as 1 | 2
        : defaultCarouselSettings.slidesPerView!.sm,
        
      md: typeof carouselSettings.slidesPerView?.md === 'number' && [1, 2, 3].includes(carouselSettings.slidesPerView.md)
        ? carouselSettings.slidesPerView.md as 1 | 2 | 3
        : defaultCarouselSettings.slidesPerView!.md,
        
      lg: typeof carouselSettings.slidesPerView?.lg === 'number' && [1, 2, 3, 4].includes(carouselSettings.slidesPerView.lg)
        ? carouselSettings.slidesPerView.lg as 1 | 2 | 3 | 4
        : defaultCarouselSettings.slidesPerView!.lg,
    },
    
    autoplay: typeof carouselSettings.autoplay === 'boolean'
      ? carouselSettings.autoplay
      : defaultCarouselSettings.autoplay,
      
    autoplayDelay: typeof carouselSettings.autoplayDelay === 'number' && carouselSettings.autoplayDelay > 0
      ? carouselSettings.autoplayDelay
      : defaultCarouselSettings.autoplayDelay,
      
    slideHeight: typeof carouselSettings.slideHeight === 'number' && carouselSettings.slideHeight > 0
      ? carouselSettings.slideHeight
      : defaultCarouselSettings.slideHeight,
      
    showIndicators: typeof carouselSettings.showIndicators === 'boolean'
      ? carouselSettings.showIndicators
      : defaultCarouselSettings.showIndicators
  };
  
  return sanitizedSettings;
}

// Function to merge features with defaults
function mergeFeatures(features: any): PresentationFeatures {
  const defaultFeatures = defaultDisplaySettings.features!;
  
  if (!features || typeof features !== 'object') {
    return defaultFeatures;
  }
  
  // Correctly parse and validate the card grid layout
  const cardGridLayout = sanitizeCardGridLayout(features.cardGridLayout);
  
  // Parse and validate carousel settings
  const carouselSettings = sanitizeCarouselSettings(features.carouselSettings);
  
  return {
    enabledViews: Array.isArray(features.enabledViews) 
      ? features.enabledViews.filter(view => validViewModes.includes(view as PresentationViewMode)) 
      : defaultFeatures.enabledViews,
    allowViewToggle: typeof features.allowViewToggle === 'boolean' 
      ? features.allowViewToggle 
      : defaultFeatures.allowViewToggle,
    showProductDetails: typeof features.showProductDetails === 'boolean' 
      ? features.showProductDetails 
      : defaultFeatures.showProductDetails,
    showPricing: typeof features.showPricing === 'boolean' 
      ? features.showPricing 
      : defaultFeatures.showPricing,
    allowDownload: typeof features.allowDownload === 'boolean' 
      ? features.allowDownload 
      : defaultFeatures.allowDownload,
    cardWidthType: (typeof features.cardWidthType === 'string' && 
      (features.cardWidthType === 'responsive' || features.cardWidthType === 'fixed'))
      ? features.cardWidthType as CardWidthType
      : defaultFeatures.cardWidthType,
    cardGridLayout: cardGridLayout,
    kanbanGroupByField: typeof features.kanbanGroupByField === 'string'
      ? features.kanbanGroupByField
      : defaultFeatures.kanbanGroupByField,
    carouselSettings: carouselSettings,
    ...(features.customCss ? { customCss: features.customCss } : {}),
    ...(features.cardWidthType === 'fixed' && typeof features.fixedCardWidth === 'number' 
      ? { fixedCardWidth: features.fixedCardWidth } 
      : {})
  };
}

export async function fetchSalesPresentationById(id: string): Promise<SalesPresentation | null> {
  try {
    const { data, error } = await supabaseCustom
      .from('sales_presentations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching sales presentation:', error);
      return null;
    }

    console.log("Raw data from Supabase:", data.display_settings);
    
    // Process display settings to ensure compatibility
    let displaySettings: PresentationDisplaySettings;
    
    if (data.display_settings) {
      try {
        const settings = data.display_settings;
        
        // Check if it's in the new format
        if (hasCardAndDialogColumns(settings)) {
          displaySettings = {
            cardColumns: sanitizeCardColumns(settings.cardColumns),
            dialogColumns: sanitizeDialogColumns(settings.dialogColumns),
            defaultView: sanitizeViewMode(settings.defaultView),
            features: hasFeatures(settings) ? mergeFeatures(settings.features) : defaultDisplaySettings.features
          };
        }
        // Check if it's in the legacy format and convert
        else if (hasDisplayColumns(settings)) {
          const legacyColumns = settings.displayColumns.filter(
            col => validCardColumns.includes(col as CardColumn)
          ) as CardColumn[];
          
          const dialogCols = [...legacyColumns];
          if (!dialogCols.includes('synopsis')) {
            dialogCols.push('synopsis' as CardColumn);
          }
          
          displaySettings = {
            cardColumns: legacyColumns,
            dialogColumns: dialogCols as DialogColumn[],
            defaultView: 'card',
            features: hasFeatures(settings) ? mergeFeatures(settings.features) : defaultDisplaySettings.features
          };
        } else {
          // Unknown format, use defaults
          displaySettings = defaultDisplaySettings;
        }
      } catch (e) {
        console.warn('Invalid display_settings format, using defaults', e);
        displaySettings = defaultDisplaySettings;
      }
    } else {
      displaySettings = defaultDisplaySettings;
    }
    
    console.log("Processed display settings:", displaySettings);

    // Cast the raw data to our SalesPresentation type with validated display settings
    return {
      ...data,
      display_settings: displaySettings
    } as SalesPresentation;
  } catch (error) {
    console.error('Failed to fetch sales presentation:', error);
    return null;
  }
}
