
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  organization_type: string;
  default_num_products: number;
  default_extra_costs?: any[];
  default_savings?: any[];
  created_at: string;
  updated_at: string;
}

export type MemberType = 'publisher' | 'supplier' | 'customer';

export interface OrganizationMember {
  id: string;
  organization_id: string;
  auth_user_id: string;
  role: string;
  member_type?: MemberType;
  created_at: string;
  updated_at: string;
}

export interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  setCurrentOrganization: (org: Organization) => void;
  refetchOrganizations: () => void;
}
