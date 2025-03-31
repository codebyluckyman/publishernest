
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationMember } from "@/context/OrganizationContext";
import { Users } from "lucide-react";
import { MemberInviteForm } from "./MemberInviteForm";
import { MemberItem } from "./MemberItem";

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
  onInvite: (organizationId: string, email: string, role: "admin" | "member") => Promise<void>;
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
  const handleInvite = async (email: string, role: "admin" | "member") => {
    await onInvite(organizationId, email, role);
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

        <div className="space-y-2">
          {loading ? (
            <p>Loading members...</p>
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
        </div>
      </CardContent>
    </Card>
  );
};
