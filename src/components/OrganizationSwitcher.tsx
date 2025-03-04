
import { useState } from "react";
import { useOrganization, Organization } from "@/context/OrganizationContext";
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between">
          <div className="flex items-center gap-2 truncate">
            <Building className="h-4 w-4" />
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
              <Building className="h-4 w-4" />
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
