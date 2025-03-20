
import { Organization } from "@/types/organization";
import { DefaultExtraCost } from "@/types/extraCost";
import { DefaultSaving } from "@/types/saving";
import { useSupabaseBase } from "./useSupabaseBase";

export const useOrganizationMutations = (userId: string | undefined) => {
  const { supabase, handleError } = useSupabaseBase(userId);

  const updateCurrentOrganization = async (organizationId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ current_organization_id: organizationId })
        .eq('id', userId);
    } catch (error) {
      console.error("Error updating current organization:", error);
      throw error;
    }
  };

  const createNewOrganization = async (name: string, type: "publisher" | "printer" | "customer" = "publisher"): Promise<Organization> => {
    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name, slug, organization_type: type })
        .select()
        .single();

      if (orgError) throw orgError;
      if (!org) throw new Error("Failed to create organization");

      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          auth_user_id: userId,
          role: 'owner'
        });

      if (memberError) throw memberError;

      await updateCurrentOrganization(org.id);
      
      // Cast organization_type, default_extra_costs, and default_savings to ensure they match the expected type
      return {
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
          : [] as DefaultSaving[]
      } as Organization;
    } catch (error: any) {
      console.error("Error creating organization:", error);
      throw error;
    }
  };

  const updateOrganizationSetting = async (organizationId: string, setting: string, value: any): Promise<Organization> => {
    try {
      // Create an update object with the setting to update
      const updateData: Record<string, any> = {};
      updateData[setting] = value;

      const { data: updatedOrg, error } = await supabase
        .from('organizations')
        .update(updateData)
        .eq('id', organizationId)
        .select('*')
        .single();

      if (error) throw error;
      if (!updatedOrg) throw new Error("Failed to update organization");

      return {
        ...updatedOrg,
        organization_type: updatedOrg.organization_type as "publisher" | "printer" | "customer",
        default_extra_costs: updatedOrg.default_extra_costs && Array.isArray(updatedOrg.default_extra_costs) 
          ? (updatedOrg.default_extra_costs as any[]).map(cost => ({
              name: cost.name || "",
              description: cost.description,
              unit_of_measure_id: cost.unit_of_measure_id
            }))
          : [] as DefaultExtraCost[],
        default_savings: updatedOrg.default_savings && Array.isArray(updatedOrg.default_savings) 
          ? (updatedOrg.default_savings as any[]).map(saving => ({
              name: saving.name || "",
              description: saving.description,
              unit_of_measure_id: saving.unit_of_measure_id
            }))
          : [] as DefaultSaving[]
      } as Organization;
    } catch (error) {
      console.error(`Error updating organization setting ${setting}:`, error);
      throw error;
    }
  };

  return {
    updateCurrentOrganization,
    createNewOrganization,
    updateOrganizationSetting
  };
};
