
import { useState, useEffect } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/context/AuthContext";
import { OrganizationMember } from "@/types/organization";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MemberInviteForm } from "./MemberInviteForm";
import { MemberItem } from "./MemberItem";
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

  const handleInviteMember = async (email: string, role: "admin" | "member") => {
    if (!currentOrganization) return;
    
    await inviteMember(currentOrganization.id, email, role);
    
    // Refresh members list
    const memberData = await getOrganizationMembers(currentOrganization.id);
    setMembers(memberData);
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
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Members</CardTitle>
        <CardDescription>
          Manage members and their roles in your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Loading members...
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  No members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <MemberItem
                  key={member.id}
                  member={member}
                  isCurrentUser={user?.id === member.auth_user_id}
                  onRoleChange={handleRoleChange}
                  onRemove={handleRemoveMember}
                />
              ))
            )}
          </TableBody>
        </Table>

        <div className="mt-6">
          <MemberInviteForm onInvite={handleInviteMember} />
        </div>
      </CardContent>
    </Card>
  );
}
