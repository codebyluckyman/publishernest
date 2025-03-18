
export type Organization = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  logo_url?: string | null;
  organization_type: "publisher" | "printer" | "customer";
  default_num_products?: number;
};

export type OrganizationMember = {
  id: string;
  organization_id: string;
  auth_user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
};

export type OrganizationContextType = {
  currentOrganization: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  createOrganization: (name: string, type: "publisher" | "printer" | "customer") => Promise<Organization | null>;
  switchOrganization: (organizationId: string) => Promise<void>;
  getOrganizationMembers: (organizationId: string) => Promise<OrganizationMember[]>;
  inviteMember: (organizationId: string, email: string, role: "admin" | "member") => Promise<void>;
  updateMemberRole: (memberId: string, role: "admin" | "member") => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateOrganizationSetting: (setting: string, value: any) => Promise<void>;
};
