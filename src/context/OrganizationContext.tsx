
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type OrganizationMember = {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
};

type OrganizationContextType = {
  currentOrganization: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  createOrganization: (name: string) => Promise<Organization | null>;
  switchOrganization: (organizationId: string) => Promise<void>;
  getOrganizationMembers: (organizationId: string) => Promise<OrganizationMember[]>;
  inviteMember: (organizationId: string, email: string, role: "admin" | "member") => Promise<void>;
  updateMemberRole: (memberId: string, role: "admin" | "member") => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's organizations
  useEffect(() => {
    if (!user) {
      setOrganizations([]);
      setCurrentOrganization(null);
      setIsLoading(false);
      return;
    }

    const fetchOrganizations = async () => {
      setIsLoading(true);
      try {
        // Get organizations the user is a member of
        const { data: memberships, error: membershipError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id);

        if (membershipError) throw membershipError;

        if (memberships && memberships.length > 0) {
          const orgIds = memberships.map(m => m.organization_id);
          
          // Get organization details
          const { data: orgs, error: orgsError } = await supabase
            .from('organizations')
            .select('*')
            .in('id', orgIds);

          if (orgsError) throw orgsError;
          setOrganizations(orgs || []);

          // Get user's current organization preference
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('current_organization_id')
            .eq('id', user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          if (profile?.current_organization_id) {
            const currentOrg = orgs?.find(org => org.id === profile.current_organization_id) || null;
            setCurrentOrganization(currentOrg);
          } else if (orgs && orgs.length > 0) {
            // If no current org is set but user has orgs, use the first one
            setCurrentOrganization(orgs[0]);
            // Update the user's current organization preference
            await supabase
              .from('profiles')
              .update({ current_organization_id: orgs[0].id })
              .eq('id', user.id);
          } else {
            setCurrentOrganization(null);
          }
        } else {
          setOrganizations([]);
          setCurrentOrganization(null);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
        toast.error("Failed to load organizations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, [user]);

  const createOrganization = async (name: string): Promise<Organization | null> => {
    if (!user) {
      toast.error("You must be logged in to create an organization");
      return null;
    }

    try {
      // Generate a slug from the name
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Insert the new organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name, slug })
        .select()
        .single();

      if (orgError) throw orgError;
      if (!org) throw new Error("Failed to create organization");

      // Add the creator as an owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memberError) throw memberError;

      // Update user's current organization
      await supabase
        .from('profiles')
        .update({ current_organization_id: org.id })
        .eq('id', user.id);

      // Update local state
      setOrganizations(prev => [...prev, org]);
      setCurrentOrganization(org);
      
      toast.success("Organization created successfully");
      return org;
    } catch (error: any) {
      console.error("Error creating organization:", error);
      toast.error(error.message || "Failed to create organization");
      return null;
    }
  };

  const switchOrganization = async (organizationId: string) => {
    if (!user) return;
    
    try {
      const org = organizations.find(o => o.id === organizationId);
      if (!org) throw new Error("Organization not found");

      // Update user's current organization preference
      await supabase
        .from('profiles')
        .update({ current_organization_id: organizationId })
        .eq('id', user.id);

      setCurrentOrganization(org);
      toast.success(`Switched to ${org.name}`);
    } catch (error: any) {
      console.error("Error switching organization:", error);
      toast.error(error.message || "Failed to switch organization");
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
      console.error("Error fetching organization members:", error);
      toast.error(error.message || "Failed to fetch organization members");
      return [];
    }
  };

  const inviteMember = async (organizationId: string, email: string, role: "admin" | "member") => {
    try {
      // Check if user with this email exists
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

      // Check if user is already a member
      const { data: existingMember, error: memberError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('user_id', userExists.id)
        .single();

      if (memberError && memberError.code !== 'PGRST116') {
        throw memberError;
      }

      if (existingMember) {
        throw new Error("User is already a member of this organization");
      }

      // Add the member
      const { error: insertError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: userExists.id,
          role
        });

      if (insertError) throw insertError;

      toast.success(`User invited to the organization`);
    } catch (error: any) {
      console.error("Error inviting member:", error);
      toast.error(error.message || "Failed to invite member");
    }
  };

  const updateMemberRole = async (memberId: string, role: "admin" | "member") => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
      toast.success("Member role updated");
    } catch (error: any) {
      console.error("Error updating member role:", error);
      toast.error(error.message || "Failed to update member role");
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      toast.success("Member removed from organization");
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast.error(error.message || "Failed to remove member");
    }
  };

  const value = {
    currentOrganization,
    organizations,
    isLoading,
    createOrganization,
    switchOrganization,
    getOrganizationMembers,
    inviteMember,
    updateMemberRole,
    removeMember
  };

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
};
