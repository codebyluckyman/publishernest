
import { OrganizationMember, MemberType } from "@/types/organization";
import { useSupabaseBase } from "./useSupabaseBase";

export const useOrganizationMembers = (userId: string | undefined) => {
  const { supabase, handleError } = useSupabaseBase(userId);

  const fetchOrganizationMembers = async (organizationId: string): Promise<OrganizationMember[]> => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) throw error;
      
      const members: OrganizationMember[] = (data || []).map(member => ({
        ...member,
        role: member.role as "owner" | "admin" | "member",
        member_type: member.member_type as MemberType
      }));
      
      return members;
    } catch (error: any) {
      console.error("Error fetching organization members:", error);
      throw error;
    }
  };

  const inviteOrganizationMember = async (organizationId: string, email: string, role: "admin" | "member", memberType: MemberType) => {
    try {
      const { data: userExists, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      if (!userExists) {
        throw new Error("User with this email does not exist");
      }

      const { data: existingMember, error: memberError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('auth_user_id', userExists.id)
        .single();

      if (memberError && memberError.code !== 'PGRST116') {
        throw memberError;
      }

      if (existingMember) {
        throw new Error("User is already a member of this organization");
      }

      const { error: insertError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          auth_user_id: userExists.id,
          role,
          member_type: memberType
        });

      if (insertError) throw insertError;
    } catch (error) {
      console.error("Error inviting member:", error);
      throw error;
    }
  };

  const updateMemberRole = async (memberId: string, role: "admin" | "member") => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating member role:", error);
      throw error;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    } catch (error) {
      console.error("Error removing member:", error);
      throw error;
    }
  };

  return {
    fetchOrganizationMembers,
    inviteOrganizationMember,
    updateMemberRole,
    removeMember
  };
};
