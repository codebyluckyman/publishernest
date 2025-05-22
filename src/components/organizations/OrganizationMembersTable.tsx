
import { useState, useEffect } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/context/AuthContext";
import { OrganizationMember, MemberType } from "@/types/organization";
import { supabase } from "@/integrations/supabase/client";
import { MembersList } from "./MembersList";
import { toast } from "sonner";

type UserProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

export function OrganizationMembersTable() {
  const { currentOrganization, getOrganizationMembers, inviteMember, updateMemberRole, removeMember } = useOrganization();
  const { user } = useAuth();
  const [members, setMembers] = useState<(OrganizationMember & { profile?: UserProfile })[]>([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    if (!currentOrganization) return;

    const fetchMembers = async () => {
      setLoading(true);
      try {
        const memberData = await getOrganizationMembers(currentOrganization.id);
        
        const memberIds = memberData.map(m => m.auth_user_id);
        
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, avatar_url')
          .in('id', memberIds);
        
        if (error) throw error;
        
        const membersWithProfiles = memberData.map(member => {
          const profile = profiles?.find(p => p.id === member.auth_user_id);
          return { ...member, profile };
        });
        
        setMembers(membersWithProfiles);
      } catch (error) {
        console.error("Error fetching members:", error);
        toast.error("Failed to fetch organization members");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, [currentOrganization, getOrganizationMembers]);

  const handleInviteMember = async (organizationId: string, email: string, role: "admin" | "member", memberType: MemberType) => {
    if (!currentOrganization) return;
    
    try {
      await inviteMember(organizationId, email, role, memberType);
      toast.success("Member invited successfully");
      
      // Refresh members list
      const memberData = await getOrganizationMembers(currentOrganization.id);
      setMembers(memberData);
    } catch (error: any) {
      toast.error(error.message || "Failed to invite member");
    }
  };

  const handleRoleChange = async (memberId: string, role: "admin" | "member") => {
    try {
      await updateMemberRole(memberId, role);
      
      setMembers(prev => 
        prev.map(member => 
          member.id === memberId ? { ...member, role } : member
        )
      );
      toast.success("Member role updated successfully");
    } catch (error) {
      toast.error("Failed to update member role");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(memberId);
      
      setMembers(prev => prev.filter(member => member.id !== memberId));
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  if (!currentOrganization) {
    return null;
  }

  return (
    <MembersList
      organizationId={currentOrganization.id}
      members={members}
      currentUserId={user?.id}
      loading={loading}
      onInvite={handleInviteMember}
      onRoleChange={handleRoleChange}
      onRemove={handleRemoveMember}
    />
  );
}
