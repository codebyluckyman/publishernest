import { useState, useEffect } from "react";
import { useOrganization, OrganizationMember. MemberType } from "@/context/OrganizationContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OrganizationDetails } from "@/components/organizations/OrganizationDetails";
import { MembersList } from "@/components/organizations/MembersList";
import { WarehousesList } from "@/components/organizations/WarehousesList";
import { DefaultPriceBreaks } from "@/components/organizations/DefaultPriceBreaks";
import { DefaultNumProducts } from "@/components/organizations/DefaultNumProducts";
import { DefaultExtraCosts } from "@/components/organizations/DefaultExtraCosts";
import { DefaultSavings } from "@/components/organizations/DefaultSavings";
import { APIManagement } from "@/components/organizations/APIManagement";
import { UnitOfMeasuresTable } from "@/components/organizations/unitOfMeasures/UnitOfMeasuresTable";
import { ProductionStepsTable } from "@/components/organizations/ProductionStepsTable";
import { Organization } from "@/types/organization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SavingsTable } from "@/components/quotes/form/savings/SavingsTable";
import { ExtraCostsTable } from "@/components/quotes/form/extra-costs/ExtraCostsTable";
import { Library, Settings, Users, Code, ListChecks, Ruler, GitMerge } from "lucide-react";

type UserProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

const Organizations = () => {
  const { 
    currentOrganization, 
    getOrganizationMembers, 
    inviteMember, 
    updateMemberRole, 
    removeMember, 
    switchOrganization 
  } = useOrganization();
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

  const handleOrganizationUpdate = (updatedOrg: Organization) => {
    switchOrganization(updatedOrg.id);
  };

  const handleInviteMember = async (organizationId: string, email: string, role: "admin" | "member", MemberType: MemberType) => {
    await inviteMember(organizationId, email, role, MemberType);
    
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

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 flex-start flex-wrap">
          <TabsTrigger value="general" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Members</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <ListChecks className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-1">
            <Code className="h-4 w-4" />
            <span>API</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OrganizationDetails 
              organization={currentOrganization} 
              onOrganizationUpdate={handleOrganizationUpdate}
            />
            <WarehousesList organizationId={currentOrganization.id} />
          </div>
        </TabsContent>

        <TabsContent value="members">
          <MembersList
            organizationId={currentOrganization.id}
            members={members}
            currentUserId={user?.id}
            loading={loading}
            onInvite={handleInviteMember}
            onRoleChange={handleRoleChange}
            onRemove={handleRemoveMember}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Tabs defaultValue="defaults" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="defaults" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                <span>Default Values</span>
              </TabsTrigger>
              <TabsTrigger value="units" className="flex items-center gap-1">
                <Ruler className="h-4 w-4" />
                <span>Units of Measure</span>
              </TabsTrigger>
              <TabsTrigger value="production" className="flex items-center gap-1">
                <GitMerge className="h-4 w-4" />
                <span>Production Process</span>
              </TabsTrigger>
              <TabsTrigger value="libraries" className="flex items-center gap-1 font-semibold">
                <Library className="h-4 w-4" />
                <span>Libraries</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="defaults" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DefaultPriceBreaks />
                <DefaultNumProducts />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DefaultExtraCosts />
                <DefaultSavings />
              </div>
            </TabsContent>

            <TabsContent value="units" className="space-y-6">
              <UnitOfMeasuresTable />
            </TabsContent>
            
            <TabsContent value="production" className="space-y-6">
              <ProductionStepsTable />
            </TabsContent>

            <TabsContent value="libraries" className="space-y-6">
              <div className="pb-4">
                <h2 className="text-xl font-semibold mb-2">Component Libraries</h2>
                <p className="text-muted-foreground">Manage your organization's reusable components for quotes and projects</p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <SavingsTable />
                <ExtraCostsTable />
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <APIManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Organizations;
