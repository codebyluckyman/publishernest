
export interface SalesPresentation {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  created_by: string;
  status: 'draft' | 'published' | 'archived';
  cover_image_url?: string;
  access_code?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  expires_at?: string;
  display_settings?: PresentationDisplaySettings;
}

export interface PresentationSection {
  id: string;
  presentation_id: string;
  title: string;
  description?: string;
  section_order: number;
  section_type: 'products' | 'text' | 'media' | 'formats' | 'custom';
  content?: any;
  created_at: string;
  updated_at: string;
}

export interface PresentationItem {
  id: string;
  section_id: string;
  item_type: 'product' | 'format' | 'custom';
  item_id?: string;
  title?: string;
  description?: string;
  custom_price?: number;
  currency?: string;
  custom_content?: any;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PresentationAnalytics {
  id: string;
  presentation_id: string;
  view_id: string;
  viewer_ip?: string;
  viewer_device?: string;
  viewer_location?: string;
  view_date: string;
  view_duration: number;
  sections_viewed: string[];
  items_viewed: string[];
  last_activity: string;
}

export interface PresentationShare {
  id: string;
  presentation_id: string;
  shared_by: string;
  shared_with?: string;
  share_link: string;
  shared_at: string;
  access_count: number;
  last_accessed?: string;
  expires_at?: string;
}

// Define the allowed column types for type safety
export type CardColumn = 
  // Basic info
  'title' | 'isbn13' | 'isbn10' | 'price' | 
  // Product details
  'product_form' | 'product_form_detail' | 'publisher' | 'publication_date' | 'status' | 
  // Physical properties - individual
  'height' | 'width' | 'thickness' | 'weight' | 
  // Physical properties - grouped
  'physical_properties' | 
  // Format details
  'format' | 'format_extras' | 'format_extra_comments' |
  // Format information from formats table
  'format_name' | 'binding_type' | 'cover_material' | 'cover_stock_print' |
  'internal_material' | 'internal_stock_print' | 'orientation' | 'extent' |
  'tps_dimensions' | 'plc_dimensions' |
  // Content details
  'page_count' | 'edition_number' | 
  // Carton information - individual
  'carton_quantity' | 'carton_dimensions' | 
  // Additional information
  'synopsis' | 'subtitle' | 'series_name' | 'age_range' | 'license' |
  // Codes
  'language_code' | 'subject_code' | 'product_availability_code';

export type DialogColumn = 
  // Basic info
  'title' | 'isbn13' | 'isbn10' | 'price' | 
  // Product details
  'product_form' | 'product_form_detail' | 'publisher' | 'publication_date' | 'status' | 
  // Physical properties - individual
  'height' | 'width' | 'thickness' | 'weight' | 
  // Physical properties - grouped
  'physical_properties' | 
  // Format details
  'format' | 'format_extras' | 'format_extra_comments' |
  // Format information from formats table
  'format_name' | 'binding_type' | 'cover_material' | 'cover_stock_print' |
  'internal_material' | 'internal_stock_print' | 'orientation' | 'extent' |
  'tps_dimensions' | 'plc_dimensions' |
  // Content details
  'page_count' | 'edition_number' | 
  // Carton information - individual
  'carton_quantity' | 'carton_length' | 'carton_width' | 'carton_height' | 'carton_weight' |
  // Carton information - grouped
  'carton_dimensions' | 
  // Additional information
  'synopsis' | 'subtitle' | 'series_name' | 'age_range' | 'license' |
  // Codes
  'language_code' | 'subject_code' | 'product_availability_code';

export type PresentationViewMode = 'card' | 'table' | 'carousel' | 'kanban';
export type CardWidthType = 'responsive' | 'fixed';

// Define grid layout configuration type
export interface CardGridLayout {
  sm?: 1 | 2;
  md?: 1 | 2 | 3;
  lg?: 2 | 3 | 4;
  xl?: 3 | 4 | 5;
  xxl?: 4 | 5 | 6;
}

export interface PresentationFeatures {
  enabledViews: PresentationViewMode[];
  allowViewToggle: boolean;
  showProductDetails: boolean;
  showPricing?: boolean;
  allowDownload?: boolean;
  customCss?: string;
  cardGridLayout?: CardGridLayout;
  cardWidthType?: CardWidthType;
  fixedCardWidth?: number;
  kanbanGroupByField?: string; // New field for Kanban grouping
  [key: string]: any; // Allow for future feature flags
}

export interface PresentationDisplaySettings {
  cardColumns: CardColumn[];
  dialogColumns: DialogColumn[];
  defaultView?: PresentationViewMode;
  features?: PresentationFeatures;
  [key: string]: any; // Add index signature for JSON compatibility
}
