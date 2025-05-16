
export interface SalesPresentation {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  created_by: string;
  status: 'draft' | 'published';
  display_settings?: PresentationDisplaySettings;
  created_at: string;
  updated_at: string;
  published_at?: string;
  expires_at?: string;
  cover_image_url?: string;
  access_code?: string;
}

export type PresentationViewMode = 'cards' | 'table' | 'carousel';

export type CardWidthType = 'responsive' | 'fixed';

export type CardGridLayout = {
  sm: 1 | 2;
  md: 1 | 2 | 3;
  lg: 2 | 3 | 4;
  xl: 3 | 4 | 5;
  xxl: 4 | 5 | 6;
};

export interface PresentationDisplaySettings {
  // Updated to include selling_points in the column options
  cardColumns?: Array<'title' | 'price' | 'isbn13' | 'isbn10' | 'publisher' | 'publication_date' | 'product_form' | 'format' | 'physical_properties' | 'selling_points'>;
  dialogColumns?: Array<'title' | 'price' | 'isbn13' | 'isbn10' | 'publisher' | 'publication_date' | 'product_form' | 'format' | 'physical_properties' | 'selling_points'>;
  defaultView?: PresentationViewMode;
  features?: {
    enabledViews?: PresentationViewMode[];
    allowViewToggle?: boolean;
    showProductDetails?: boolean;
    allowDownload?: boolean;
    showPricing?: boolean;
    cardWidthType?: CardWidthType;
    fixedCardWidth?: number;
    cardGridLayout?: CardGridLayout;
    carouselSettings?: {
      slidesPerView?: {
        sm: number;
        md: number;
        lg: number;
      };
      slideHeight?: number;
      showIndicators?: boolean;
      autoplay?: boolean;
      autoplayDelay?: number;
      cardLayout?: 'standard' | 'product-sheet';
      layoutOptions?: {
        showCover?: boolean;
        showSynopsis?: boolean;
        showSellingPoints?: boolean;
        showSpecsTable?: boolean;
        imageSide?: 'left' | 'right' | 'top';
        coverToDescriptionRatio?: number;
        includeTableBorders?: boolean;
        alternateRowColors?: boolean;
      };
      sectionStyles?: {
        useBorders?: boolean;
        borderColor?: string;
        headerBackground?: string;
        sectionPadding?: number;
      };
    };
  };
}
