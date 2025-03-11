
import { useState } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { Organization } from "@/types/organization";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Building, ChevronDown, Plus } from "lucide-react";
import { useForm } from "react-hook-form";

type OrganizationType = "publisher" | "printer" | "customer";

type OrgFormValues = {
  name: string;
  type: OrganizationType;
};

const OrganizationSwitcher = () => {
  const { currentOrganization, organizations, createOrganization, switchOrganization } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const form = useForm<OrgFormValues>({
    defaultValues: {
      name: "",
      type: "publisher"
    }
  });

  const handleCreateOrganization = async (values: OrgFormValues) => {
    if (!values.name.trim()) return;
    
    const result = await createOrganization(values.name, values.type);
    if (result) {
      form.reset();
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateOrganization)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization name</FormLabel>
                    <FormControl>
                      <Input placeholder="Organization name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value as OrganizationType)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="publisher">Publisher</SelectItem>
                        <SelectItem value="printer">Printer</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </Form>
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
              <span className="ml-auto text-xs opacity-70">
                {org.organization_type.charAt(0).toUpperCase() + org.organization_type.slice(1)}
              </span>
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateOrganization)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization name</FormLabel>
                        <FormControl>
                          <Input placeholder="Organization name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization type</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => field.onChange(value as OrganizationType)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select organization type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="publisher">Publisher</SelectItem>
                            <SelectItem value="printer">Printer</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">Create</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationSwitcher;
