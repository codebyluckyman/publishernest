
import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { useOrganizationApi } from "@/hooks/useOrganizationApi";
import { Organization, OrganizationContextType, OrganizationMember } from "@/types/organization";

export const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const api = useOrganizationApi(user?.id);

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
        const orgs = await api.fetchUserOrganizations();
        setOrganizations(orgs);

        const currentOrgId = await api.getCurrentOrganizationId();

        if (currentOrgId) {
          const currentOrg = orgs.find(org => org.id === currentOrgId) || null;
          setCurrentOrganization(currentOrg);
        } else if (orgs.length > 0) {
          setCurrentOrganization(orgs[0]);
          await api.updateCurrentOrganization(orgs[0].id);
        } else {
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
      const org = await api.createNewOrganization(name);
      
      setOrganizations(prev => [...prev, org]);
      setCurrentOrganization(org);
      
      toast.success("Organization created successfully");
      return org;
    } catch (error: any) {
      toast.error(error.message || "Failed to create organization");
      return null;
    }
  };

  const switchOrganization = async (organizationId: string) => {
    if (!user) return;
    
    try {
      const org = organizations.find(o => o.id === organizationId);
      if (!org) throw new Error("Organization not found");

      await api.updateCurrentOrganization(organizationId);

      setCurrentOrganization(org);
      toast.success(`Switched to ${org.name}`);
    } catch (error: any) {
      console.error("Error switching organization:", error);
      toast.error(error.message || "Failed to switch organization");
    }
  };

  const getOrganizationMembers = async (organizationId: string): Promise<OrganizationMember[]> => {
    try {
      const members = await api.fetchOrganizationMembers(organizationId);
      return members;
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch organization members");
      return [];
    }
  };

  const inviteMember = async (organizationId: string, email: string, role: "admin" | "member") => {
    try {
      await api.inviteOrganizationMember(organizationId, email, role);
      toast.success(`User invited to the organization`);
    } catch (error: any) {
      toast.error(error.message || "Failed to invite member");
    }
  };

  const updateMemberRole = async (memberId: string, role: "admin" | "member") => {
    try {
      await api.updateMemberRole(memberId, role);
      toast.success("Member role updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update member role");
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      await api.removeMember(memberId);
      toast.success("Member removed from organization");
    } catch (error: any) {
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
