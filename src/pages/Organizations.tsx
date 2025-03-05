
import { useState, useEffect } from "react";
import { useOrganization, OrganizationMember } from "@/context/OrganizationContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OrganizationDetails } from "@/components/organizations/OrganizationDetails";
import { MembersList } from "@/components/organizations/MembersList";
import { WarehousesList } from "@/components/organizations/WarehousesList";

type UserProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
};

const Organizations = () => {
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
          .select('id, email, first_name, last_name')
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

  const handleInviteMember = async (organizationId: string, email: string, role: "admin" | "member") => {
    await inviteMember(organizationId, email, role);
    
    if (currentOrganization) {
      const memberData = await getOrganizationMembers(currentOrganization.id);
      setMembers(memberData);
    }
  };

  const handleRoleChange = async (memberId: string, role: "admin" | "member") => {
    await updateMemberRole(memberId, role);
    
    setMembers(prev => 
      prev.map(member => 
        member.id === memberId ? { ...member, role } : member
      )
    );
  };

  const handleRemoveMember = async (memberId: string) => {
    await removeMember(memberId);
    
    setMembers(prev => prev.filter(member => member.id !== memberId));
  };

  if (!currentOrganization) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Organizations</h1>
          <p className="text-gray-600">You don't have any organizations yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Organization Settings</h1>
        <p className="text-gray-600">Manage your organization and team members</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <OrganizationDetails organization={currentOrganization} />
          <WarehousesList organizationId={currentOrganization.id} />
        </div>
        
        <MembersList
          organizationId={currentOrganization.id}
          members={members}
          currentUserId={user?.id}
          loading={loading}
          onInvite={handleInviteMember}
          onRoleChange={handleRoleChange}
          onRemove={handleRemoveMember}
        />
      </div>
    </div>
  );
};

export default Organizations;
