
import { useOrganization } from "@/context/OrganizationContext";
import { useSuppliersApi } from "./useSuppliersApi";

export const useSuppliers = (organizationId?: string) => {
  const { currentOrganization } = useOrganization();
  const org = organizationId ? { id: organizationId } : currentOrganization;
  
  const result = useSuppliersApi(org);
  
  return { 
    suppliers: result.suppliers,
    loading: result.isLoading,
    error: result.error,
    refetch: result.refetch
  };
};
