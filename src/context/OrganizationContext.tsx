
// This file is now just a re-export file for backward compatibility
import { OrganizationContext, OrganizationProvider } from './OrganizationProvider';
import { useOrganization } from '@/hooks/useOrganization';
import type { Organization, OrganizationMember, OrganizationContextType, MemberType } from '@/types/organization';

export { 
  OrganizationContext, 
  OrganizationProvider,
  useOrganization,
  type Organization,
  type OrganizationMember,
  type OrganizationContextType
  type MemberType
};
