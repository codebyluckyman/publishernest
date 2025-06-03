
import { Organization } from "@/types/organization";
import { DefaultExtraCost } from "@/types/extraCost";
import { DefaultSaving } from "@/types/saving";
import { useSupabaseBase } from "./useSupabaseBase";
import { toast } from "sonner";

export const useOrganizationFetch = (userId: string | undefined) => {
  const { supabase, handleError } = useSupabaseBase(userId);

  const fetchUserOrganizations = async (): Promise<Organization[]> => {
    try {
      const { data: memberships, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id, member_type') // Added member_type to the select
        .eq('auth_user_id', userId);

      if (membershipError) throw membershipError;

      if (memberships && memberships.length > 0) {
        // Create a map of organization IDs to member types
        const memberTypeMap = memberships.reduce((acc, membership) => {
          acc[membership.organization_id] = membership.member_type;
          return acc;
        }, {} as Record<string, string | undefined>);
        
        const orgIds = memberships.map(m => m.organization_id);
        
        const { data: orgs, error: orgsError } = await supabase
          .from('organizations')
          .select('*')
          .in('id', orgIds);

        if (orgsError) throw orgsError;
        
        // Cast organization_type, default_extra_costs, and default_savings to proper types
        // Also add the member_type to each organization
        return (orgs || []).map(org => ({
          ...org,
          organization_type: org.organization_type as "publisher" | "printer" | "customer",
          default_extra_costs: org.default_extra_costs && Array.isArray(org.default_extra_costs) 
            ? (org.default_extra_costs as any[]).map(cost => ({
                name: cost.name || "",
                description: cost.description,
                unit_of_measure_id: cost.unit_of_measure_id
              })) 
            : [] as DefaultExtraCost[],
          default_savings: org.default_savings && Array.isArray(org.default_savings) 
            ? (org.default_savings as any[]).map(saving => ({
                name: saving.name || "",
                description: saving.description,
                unit_of_measure_id: saving.unit_of_measure_id
              })) 
            : [] as DefaultSaving[],
          userMemberType: memberTypeMap[org.id] // Add the member_type for this user-organization relationship
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
