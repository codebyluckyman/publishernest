
export type PresentationViewMode = 'card' | 'table' | 'grid' | 'carousel';

export interface PresentationFeatures {
  enabledViews: PresentationViewMode[];
  allowViewToggle: boolean;
  showProductDetails: boolean;
  showPricing?: boolean;
}

export interface PresentationDisplaySettings {
  cardColumns?: string[];
  dialogColumns?: string[];
  displayColumns?: string[];
  defaultView: PresentationViewMode;
  features: PresentationFeatures;
}

export interface SalesPresentation {
  id: string;
  title: string;
  description?: string | null;
  status: 'draft' | 'published' | 'archived';
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  expires_at?: string | null;
  cover_image_url?: string | null;
  display_settings?: PresentationDisplaySettings;
  access_code?: string | null;
}

export interface PresentationSection {
  id: string;
  presentation_id: string;
  title: string;
  description?: string | null;
  section_type: 'products' | 'text' | 'images' | 'custom';
  section_order: number;
  content?: any;
  created_at: string;
  updated_at: string;
}

export interface PresentationItem {
  id: string;
  section_id: string;
  item_type: 'product' | 'text' | 'image' | 'custom';
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

export interface PresentationShare {
  id: string;
  presentation_id: string;
  share_token: string;
  share_link: string;
  shared_by: string;
  shared_with?: string;
  shared_at: string;
  expires_at?: string | null;
  last_accessed?: string | null;
  access_count?: number;
}
