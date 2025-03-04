import { useState, useEffect } from "react";
import { useOrganization, OrganizationMember } from "@/context/OrganizationContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Users, UserPlus, Shield, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");

  useEffect(() => {
    if (!currentOrganization) return;

    const fetchMembers = async () => {
      setLoading(true);
      try {
        const memberData = await getOrganizationMembers(currentOrganization.id);
        
        const memberIds = memberData.map(m => m.user_id);
        
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name')
          .in('id', memberIds);
        
        if (error) throw error;
        
        const membersWithProfiles = memberData.map(member => {
          const profile = profiles?.find(p => p.id === member.user_id);
          return { ...member, profile };
        });
        
        setMembers(membersWithProfiles);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, [currentOrganization, getOrganizationMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization || !inviteEmail.trim()) return;
    
    await inviteMember(currentOrganization.id, inviteEmail, inviteRole);
    setInviteEmail("");
    
    const memberData = await getOrganizationMembers(currentOrganization.id);
    setMembers(memberData);
  };

  const handleRoleChange = async (memberId: string, role: "admin" | "member") => {
    if (!currentOrganization) return;
    
    await updateMemberRole(memberId, role);
    
    setMembers(prev => 
      prev.map(member => 
        member.id === memberId ? { ...member, role } : member
      )
    );
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentOrganization) return;
    
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Organization Details
            </CardTitle>
            <CardDescription>Update your organization information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization Name</label>
              <Input value={currentOrganization.name} disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization Slug</label>
              <Input value={currentOrganization.slug} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <CardDescription>Manage your team members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleInvite} className="flex gap-2 items-end">
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
              <Button type="submit" size="icon" className="shrink-0 h-10">
                <UserPlus className="h-5 w-5" />
              </Button>
            </form>

            <div className="space-y-2">
              {loading ? (
                <p>Loading members...</p>
              ) : (
                members.map((member) => {
                  const isOwner = member.role === "owner";
                  const isCurrentUser = member.user_id === user?.id;
                  
                  return (
                    <div key={member.id} className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${isOwner ? "bg-amber-100" : member.role === "admin" ? "bg-blue-100" : "bg-gray-100"}`}>
                          {isOwner ? (
                            <Shield className="h-4 w-4 text-amber-600" />
                          ) : member.role === "admin" ? (
                            <Shield className="h-4 w-4 text-blue-600" />
                          ) : (
                            <User className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{member.profile?.email || "Unknown User"}</div>
                          <div className="text-xs text-gray-500">
                            {isOwner ? "Owner" : member.role === "admin" ? "Admin" : "Member"}
                            {isCurrentUser && " (You)"}
                          </div>
                        </div>
                      </div>
                      
                      {!isOwner && !isCurrentUser && (
                        <div className="flex gap-2">
                          <Select 
                            value={member.role} 
                            onValueChange={(value) => handleRoleChange(member.id, value as "admin" | "member")}
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
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={isOwner}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Organizations;
