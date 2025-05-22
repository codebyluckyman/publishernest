
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { MemberType } from "@/types/organization";

interface MemberInviteFormProps {
  onInvite: (email: string, role: "admin" | "member", memberType: MemberType) => Promise<void>;
}

export const MemberInviteForm = ({ onInvite }: MemberInviteFormProps) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [memberType, setMemberType] = useState<MemberType>("publisher");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    await onInvite(inviteEmail, inviteRole, memberType);
    setInviteEmail("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input 
          type="email" 
          placeholder="user@example.com" 
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          required
        />
      </div>
      <div className="w-28 space-y-2">
        <label className="text-sm font-medium">Role</label>
        <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as "admin" | "member")}>
          <SelectTrigger>
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-28 space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select value={memberType} onValueChange={(value) => setMemberType(value as MemberType)}>
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="publisher">Publisher</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="supplier">Supplier</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" size="icon" className="shrink-0 h-10">
        <UserPlus className="h-5 w-5" />
      </Button>
    </form>
  );
};
