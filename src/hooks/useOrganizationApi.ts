
import { supabase } from "@/integrations/supabase/client";
import { Organization, OrganizationMember } from "@/types/organization";
import { toast } from "sonner";

export const useOrganizationApi = (userId: string | undefined) => {
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
        
        // Cast organization_type to proper type
        return (orgs || []).map(org => ({
          ...org,
          organization_type: org.organization_type as "publisher" | "printer" | "customer"
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
      
      // Cast organization_type to ensure it matches the expected type
      return {
        ...org,
        organization_type: org.organization_type as "publisher" | "printer" | "customer"
      } as Organization;
    } catch (error: any) {
      console.error("Error creating organization:", error);
      throw error;
    }
  };

  const fetchOrganizationMembers = async (organizationId: string): Promise<OrganizationMember[]> => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) throw error;
      
      const members: OrganizationMember[] = (data || []).map(member => ({
        ...member,
        role: member.role as "owner" | "admin" | "member"
      }));
      
      return members;
    } catch (error: any) {
      console.error("Error fetching organization members:", error);
      throw error;
    }
  };

  const inviteOrganizationMember = async (organizationId: string, email: string, role: "admin" | "member") => {
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
          role
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
    fetchUserOrganizations,
    getCurrentOrganizationId,
    updateCurrentOrganization,
    createNewOrganization,
    fetchOrganizationMembers,
    inviteOrganizationMember,
    updateMemberRole,
    removeMember
  };
};
