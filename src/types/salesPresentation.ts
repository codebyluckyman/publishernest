
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
