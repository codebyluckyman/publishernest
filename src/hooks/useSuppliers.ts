
import { useOrganization } from "@/context/OrganizationContext";
import { useSuppliersApi } from "./useSuppliersApi";
import { Organization } from "@/types/organization";
import { Supplier } from "@/types/supplier";

// Accept either a full Organization or just an id string
type OrganizationParam = Organization | string | { id: string };

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
  
  // Create a minimal organization object with just the ID
  const result = useSuppliersApi(
    orgId ? { id: orgId } : null
  );
  
  return { 
    suppliers: result.suppliers,
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch
  };
};
