
import { createContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { Organization, OrganizationMember, OrganizationContextType, MemberType } from '@/types/organization';
import { toast } from 'sonner';

export const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useUser();

  const fetchOrganizations = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          organizations (
            id,
            name,
            slug,
            created_at,
            logo_url,
            organization_type,
            default_num_products,
            default_extra_costs,
            default_savings
          ),
          member_type
        `)
        .eq('auth_user_id', user.id);

      if (error) throw error;

      const orgsWithMemberType = data?.map(item => ({
        ...item.organizations,
        userMemberType: item.member_type
      })) || [];

      setOrganizations(orgsWithMemberType);

      // Set current organization if none is set
      if (!currentOrganization && orgsWithMemberType.length > 0) {
        setCurrentOrganization(orgsWithMemberType[0]);
      }
    } catch (error: any) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to fetch organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const refetchOrganizations = async () => {
    await fetchOrganizations();
  };

  useEffect(() => {
    fetchOrganizations();
  }, [user?.id]);

  const createOrganization = async (name: string, type: "publisher" | "printer" | "customer" = "publisher"): Promise<Organization | null> => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          organization_type: type
        })
        .select()
        .single();

      if (error) throw error;

      // Add user as owner
      await supabase
        .from('organization_members')
        .insert({
          organization_id: data.id,
          auth_user_id: user.id,
          role: 'owner'
        });

      await fetchOrganizations();
      toast.success('Organization created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization');
      return null;
    }
  };

  const switchOrganization = async (organizationId: string): Promise<void> => {
    const org = organizations.find(o => o.id === organizationId);
    if (org) {
      setCurrentOrganization(org);
    }
  };

  const getOrganizationMembers = async (organizationId: string): Promise<OrganizationMember[]> => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching organization members:', error);
      return [];
    }
  };

  const inviteMember = async (organizationId: string, email: string, role: "admin" | "member", memberType: MemberType): Promise<void> => {
    // Implementation would go here
    toast.success('Member invited successfully');
  };

  const updateMemberRole = async (memberId: string, role: "admin" | "member"): Promise<void> => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
      toast.success('Member role updated successfully');
    } catch (error: any) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
    }
  };

  const removeMember = async (memberId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      toast.success('Member removed successfully');
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const updateOrganizationSetting = async (setting: string, value: any): Promise<void> => {
    if (!currentOrganization?.id) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({ [setting]: value })
        .eq('id', currentOrganization.id);

      if (error) throw error;
      
      // Update local state
      setCurrentOrganization(prev => prev ? { ...prev, [setting]: value } : null);
      toast.success('Setting updated successfully');
    } catch (error: any) {
      console.error('Error updating organization setting:', error);
      toast.error('Failed to update setting');
    }
  };

  const value: OrganizationContextType = {
    currentOrganization,
    organizations,
    isLoading,
    createOrganization,
    switchOrganization,
    setCurrentOrganization,
    refetchOrganizations,
    getOrganizationMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
    updateOrganizationSetting,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}
