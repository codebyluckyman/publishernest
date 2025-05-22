
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationMember, MemberType } from "@/types/organization";
import { Users } from "lucide-react";
import { MemberInviteForm } from "./MemberInviteForm";
import { MemberItem } from "./MemberItem";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const handleInvite = async (email: string, role: "admin" | "member", memberType: MemberType) => {
    await onInvite(organizationId, email, role, memberType);
  };

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
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">No members found</TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
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
