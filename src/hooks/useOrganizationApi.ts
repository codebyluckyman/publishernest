
import { Organization } from "@/types/organization";
import { useOrganizationFetch } from "./organization/useOrganizationFetch";
import { useOrganizationMutations } from "./organization/useOrganizationMutations";
import { useOrganizationMembers } from "./organization/useOrganizationMembers";

export const useOrganizationApi = (userId: string | undefined) => {
  const { 
    fetchUserOrganizations, 
    getCurrentOrganizationId 
  } = useOrganizationFetch(userId);
  
  const { 
    updateCurrentOrganization, 
    createNewOrganization,
    updateOrganizationSetting
  } = useOrganizationMutations(userId);
  
  const { 
    fetchOrganizationMembers, 
    inviteOrganizationMember, 
    updateMemberRole, 
    removeMember 
  } = useOrganizationMembers(userId);

  return {
    fetchUserOrganizations,
    getCurrentOrganizationId,
    updateCurrentOrganization,
    createNewOrganization,
    fetchOrganizationMembers,
    inviteOrganizationMember,
    updateMemberRole,
    removeMember,
    updateOrganizationSetting
  };
};
