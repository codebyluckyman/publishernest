
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, User } from "lucide-react";
import { OrganizationMember, MemberType } from "@/types/organization";
import UserAvatar from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";

type UserProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

interface MemberItemProps {
  member: OrganizationMember & { profile?: UserProfile };
  isCurrentUser: boolean;
  onRoleChange: (memberId: string, role: "admin" | "member") => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
}

export const MemberItem = ({ 
  member, 
  isCurrentUser, 
  onRoleChange, 
  onRemove 
}: MemberItemProps) => {
  const isOwner = member.role === "owner";
  const displayName = member.profile?.first_name && member.profile?.last_name
    ? `${member.profile.first_name} ${member.profile.last_name}`
    : member.profile?.email || "Unknown User";

  const getUserInitials = () => {
    if (member.profile?.first_name && member.profile?.last_name) {
      return `${member.profile.first_name[0]}${member.profile.last_name[0]}`.toUpperCase();
    }
    return member.profile?.email ? member.profile.email[0].toUpperCase() : "?";
  };

  // Get member type display name
  const getMemberTypeLabel = (memberType?: MemberType) => {
    if (!memberType) return 'User';
    
    switch (memberType.toLowerCase()) {
      case 'publisher':
        return 'Publisher';
      case 'customer':
        return 'Customer';
      case 'supplier':
        return 'Supplier';
      default:
        return 'User';
    }
  };

  // Get badge variant based on member type
  const getMemberTypeVariant = (memberType?: MemberType) => {
    if (!memberType) return 'secondary';
    
    switch (memberType.toLowerCase()) {
      case 'publisher':
        return 'default';
      case 'customer':
        return 'success';
      case 'supplier':
        return 'blue';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="flex items-center justify-between py-2 border-b">
      <div className="flex items-center gap-3">
        {member.profile?.avatar_url ? (
          <UserAvatar 
            avatarUrl={member.profile.avatar_url}
            fallback={getUserInitials()}
            className="h-9 w-9"
          />
        ) : (
          <div className={`p-1 rounded ${isOwner ? "bg-amber-100" : member.role === "admin" ? "bg-blue-100" : "bg-gray-100"}`}>
            {isOwner ? (
              <Shield className="h-4 w-4 text-amber-600" />
            ) : member.role === "admin" ? (
              <Shield className="h-4 w-4 text-blue-600" />
            ) : (
              <User className="h-4 w-4 text-gray-600" />
            )}
          </div>
        )}
        <div>
          <div className="font-medium">{displayName}</div>
          <div className="text-xs text-gray-500">
            {member.profile?.email && displayName !== member.profile.email && (
              <span className="block">{member.profile.email}</span>
            )}
            <span>
              {isOwner ? "Owner" : member.role === "admin" ? "Admin" : "Member"}
              {isCurrentUser && " (You)"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={getMemberTypeVariant(member.member_type)}>
          {getMemberTypeLabel(member.member_type)}
        </Badge>
      </div>
      
      {!isOwner && !isCurrentUser && (
        <div className="flex gap-2">
          <Select 
            value={member.role} 
            onValueChange={(value) => onRoleChange(member.id, value as "admin" | "member")}
            disabled={isOwner}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onRemove(member.id)}
            disabled={isOwner}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};
