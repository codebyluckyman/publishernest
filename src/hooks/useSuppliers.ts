
import { useOrganization } from "@/context/OrganizationContext";
import { useSuppliersApi } from "./useSuppliersApi";
import { Organization } from "@/types/organization";

// Accept either a full Organization or just an id string
type OrganizationParam = Organization | { id: string } | string;

export const useSuppliers = (organizationParam?: OrganizationParam) => {
  const { currentOrganization } = useOrganization();
  
  // Determine the organization ID to use
  let orgId: string | undefined;
  
  if (typeof organizationParam === 'string') {
    orgId = organizationParam;
  } else if (organizationParam && 'id' in organizationParam) {
    orgId = organizationParam.id;
  } else if (currentOrganization) {
    orgId = currentOrganization.id;
  }
  
  const org = orgId ? { id: orgId } : undefined;
  const result = useSuppliersApi(org);
  
  return { 
    suppliers: result.suppliers,
    loading: result.isLoading,
    error: result.error,
    refetch: result.refetch
  };
};
