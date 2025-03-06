
import { useState } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { Organization } from "@/types/organization";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Building, ChevronDown, Plus } from "lucide-react";

const OrganizationSwitcher = () => {
  const { currentOrganization, organizations, createOrganization, switchOrganization } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    
    const result = await createOrganization(newOrgName);
    if (result) {
      setNewOrgName("");
      setIsCreating(false);
      setIsOpen(false);
    }
  };

  const handleSwitchOrganization = async (org: Organization) => {
    await switchOrganization(org.id);
    setIsOpen(false);
  };

  if (!currentOrganization) {
    return (
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            Create Organization
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new organization</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOrganization} className="space-y-4">
            <Input
              placeholder="Organization name"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
            />
            <Button type="submit" className="w-full">Create</Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Display organization logo if available
  const OrgIcon = () => {
    if (currentOrganization.logo_url) {
      return (
        <img 
          src={currentOrganization.logo_url} 
          alt={`${currentOrganization.name} logo`} 
          className="h-5 w-5 rounded-sm object-contain"
        />
      );
    }
    return <Building className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between">
          <div className="flex items-center gap-2 truncate">
            <OrgIcon />
            <span className="truncate">{currentOrganization.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Switch Organization</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {organizations.map((org) => (
            <Button
              key={org.id}
              variant={org.id === currentOrganization?.id ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => handleSwitchOrganization(org)}
            >
              {org.logo_url ? (
                <img 
                  src={org.logo_url} 
                  alt={`${org.name} logo`} 
                  className="h-4 w-4 rounded-sm object-contain" 
                />
              ) : (
                <Building className="h-4 w-4" />
              )}
              {org.name}
            </Button>
          ))}
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                Create New Organization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new organization</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateOrganization} className="space-y-4">
                <Input
                  placeholder="Organization name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                />
                <Button type="submit" className="w-full">Create</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationSwitcher;
