
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationMember, MemberType } from "@/types/organization";
import { Users } from "lucide-react";
import { MemberInviteForm } from "./MemberInviteForm";
import { MemberItem } from "./MemberItem";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { MembersTableHeader } from "./MembersTableHeader";

type UserProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

interface MembersListProps {
  organizationId: string;
  members: (OrganizationMember & { profile?: UserProfile })[];
  currentUserId: string | undefined;
  loading: boolean;
  onInvite: (organizationId: string, email: string, role: "admin" | "member", memberType: MemberType) => Promise<void>;
  onRoleChange: (memberId: string, role: "admin" | "member") => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
}

export const MembersList = ({ 
  organizationId,
  members, 
  currentUserId,
  loading,
  onInvite,
  onRoleChange,
  onRemove
}: MembersListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState("");
  const [filteredMembers, setFilteredMembers] = useState(members);

  const handleInvite = async (email: string, role: "admin" | "member", memberType: MemberType) => {
    await onInvite(organizationId, email, role, memberType);
  };

  useEffect(() => {
    // Apply filters
    const filtered = members.filter(member => {
      // Filter by search query (name or email)
      const memberName = member.profile?.first_name && member.profile?.last_name
        ? `${member.profile.first_name} ${member.profile.last_name}`.toLowerCase()
        : member.profile?.email?.toLowerCase() || "";
      const memberEmail = member.profile?.email?.toLowerCase() || "";
      
      const searchMatch = !searchQuery || 
        memberName.includes(searchQuery.toLowerCase()) || 
        memberEmail.includes(searchQuery.toLowerCase());

      // Filter by role
      const roleMatch = !roleFilter || member.role === roleFilter;

      // Filter by member type
      const typeMatch = !memberTypeFilter || member.member_type === memberTypeFilter;

      return searchMatch && roleMatch && typeMatch;
    });

    setFilteredMembers(filtered);
  }, [members, searchQuery, roleFilter, memberTypeFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Members
        </CardTitle>
        <CardDescription>Manage your team members</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <MemberInviteForm onInvite={handleInvite} />

        <MembersTableHeader 
          onSearchChange={setSearchQuery}
          onRoleFilterChange={setRoleFilter}
          onMemberTypeFilterChange={setMemberTypeFilter}
          roleFilter={roleFilter}
          memberTypeFilter={memberTypeFilter}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">Loading members...</TableCell>
              </TableRow>
            ) : filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  {members.length === 0 ? "No members found" : "No results match your search"}
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <MemberItem
                  key={member.id}
                  member={member}
                  isCurrentUser={member.auth_user_id === currentUserId}
                  onRoleChange={onRoleChange}
                  onRemove={onRemove}
                />
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
