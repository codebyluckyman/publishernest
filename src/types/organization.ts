
export type Organization = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  logo_url?: string | null;
  organization_type: "publisher" | "printer" | "customer";
  default_num_products?: number;
  default_extra_costs?: {
    name: string;
    description?: string;
    unit_of_measure_id?: string;
  }[];
  default_savings?: {
    name: string;
    description?: string;
    unit_of_measure_id?: string;
  }[];
  userMemberType?: string; // To store the user's member type for this organization
};

export type MemberType = "publisher" | "customer" | "supplier";

export type OrganizationMember = {
  id: string;
  organization_id: string;
  auth_user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
  member_type?: MemberType; // Added member_type field to specify the type of member the user is relating to the associated organization
};

export type OrganizationProductionStep = {
  id: string;
  organization_id: string;
  step_name: string;
  description?: string;
  order_number: number;
  is_active: boolean;
  estimated_days?: number;
  created_at: string;
  updated_at: string;
};

export type OrganizationContextType = {
  currentOrganization: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  createOrganization: (name: string, type: "publisher" | "printer" | "customer") => Promise<Organization | null>;
  switchOrganization: (organizationId: string) => Promise<void>;
  getOrganizationMembers: (organizationId: string) => Promise<OrganizationMember[]>;
  inviteMember: (organizationId: string, email: string, role: "admin" | "member", memberType: MemberType) => Promise<void>;
  updateMemberRole: (memberId: string, role: "admin" | "member") => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateOrganizationSetting: (setting: string, value: any) => Promise<void>;
};
