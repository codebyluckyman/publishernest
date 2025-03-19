
import { Organization } from "@/types/organization";
import { DefaultExtraCost } from "@/types/extraCost";
import { useSupabaseBase } from "./useSupabaseBase";

export const useOrganizationFetch = (userId: string | undefined) => {
  const { supabase, handleError } = useSupabaseBase(userId);

  const fetchUserOrganizations = async (): Promise<Organization[]> => {
    try {
      const { data: memberships, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('auth_user_id', userId);

      if (membershipError) throw membershipError;

      if (memberships && memberships.length > 0) {
        const orgIds = memberships.map(m => m.organization_id);
        
        const { data: orgs, error: orgsError } = await supabase
          .from('organizations')
          .select('*')
          .in('id', orgIds);

        if (orgsError) throw orgsError;
        
        // Cast organization_type and default_extra_costs to proper types
        return (orgs || []).map(org => ({
          ...org,
          organization_type: org.organization_type as "publisher" | "printer" | "customer",
          default_extra_costs: org.default_extra_costs && Array.isArray(org.default_extra_costs) 
            ? (org.default_extra_costs as any[]).map(cost => ({
                name: cost.name || "",
                description: cost.description,
                unit_of_measure_id: cost.unit_of_measure_id
              })) 
            : [] as DefaultExtraCost[]
        })) as Organization[];
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching organizations:", error);
      toast.error("Failed to load organizations");
      return [];
    }
  };

  const getCurrentOrganizationId = async () => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_organization_id')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      return profile?.current_organization_id || null;
    } catch (error) {
      console.error("Error fetching current organization:", error);
      return null;
    }
  };

  return {
    fetchUserOrganizations,
    getCurrentOrganizationId
  };
};
