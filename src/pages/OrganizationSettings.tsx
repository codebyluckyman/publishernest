import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";
import { OrganizationMembersTable } from "@/components/organizations/OrganizationMembersTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnitOfMeasuresTable } from "@/components/organizations/unitOfMeasures/UnitOfMeasuresTable";
import { DefaultExtraCosts } from "@/components/organizations/DefaultExtraCosts";
import { DefaultSavings } from "@/components/organizations/DefaultSavings";
import { NumberInput } from "@/components/NumberInput";
import { SavingsTable } from "@/components/quotes/form/savings/SavingsTable";
import { ExtraCostsTable } from "@/components/quotes/form/extra-costs/ExtraCostsTable";
import { ProductionStepsTable } from "@/components/organizations/ProductionStepsTable";
import { CustomFieldsTab } from "@/components/organizations/CustomFieldsTab";
import { Library, Settings, Users, Ruler, ListChecks, GitMerge, Database } from "lucide-react";

export default function OrganizationSettings() {
  const { currentOrganization, updateOrganizationSetting } = useOrganization();
  const [orgName, setOrgName] = useState(currentOrganization?.name || "");
  const [defaultNumProducts, setDefaultNumProducts] = useState(currentOrganization?.default_num_products || 1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const handleUpdateOrganization = async () => {
    if (!currentOrganization) return;
    
    setIsUpdating(true);
    try {
      await updateOrganizationSetting('name', orgName);
      toast.success("Organization name updated successfully");
    } catch (error) {
      console.error("Error updating organization name:", error);
      toast.error("Failed to update organization name");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateDefaultNumProducts = async () => {
    if (!currentOrganization) return;
    
    setIsUpdating(true);
    try {
      await updateOrganizationSetting('default_num_products', defaultNumProducts);
      toast.success("Default number of products updated successfully");
    } catch (error) {
      console.error("Error updating default number of products:", error);
      toast.error("Failed to update default number of products");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Organization Settings</h1>
        <p className="text-gray-600 mb-6">Manage your organization settings and team members</p>
      </div>

      <Tabs defaultValue="general" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex flex-wrap overflow-x-auto">
          <TabsTrigger value="general" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Members</span>
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center gap-1">
            <Ruler className="h-4 w-4" />
            <span>Units of Measure</span>
          </TabsTrigger>
          <TabsTrigger value="defaults" className="flex items-center gap-1">
            <ListChecks className="h-4 w-4" />
            <span>Default Values</span>
          </TabsTrigger>
          <TabsTrigger value="production" className="flex items-center gap-1">
            <GitMerge className="h-4 w-4" />
            <span>Production Process</span>
          </TabsTrigger>
          <TabsTrigger value="customfields" className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            <span>Custom Fields</span>
          </TabsTrigger>
          <TabsTrigger value="libraries" className="flex items-center gap-1 font-semibold">
            <Library className="h-4 w-4" />
            <span>Libraries</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Update your organization's basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right text-sm font-medium">
                    Organization Name
                  </label>
                  <div className="col-span-3">
                    <Input
                      id="name"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleUpdateOrganization} disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Organization"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <OrganizationMembersTable />
        </TabsContent>

        <TabsContent value="units" className="space-y-6">
          <UnitOfMeasuresTable />
        </TabsContent>

        <TabsContent value="defaults" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Quote Values</CardTitle>
              <CardDescription>Configure default values for new quote requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="defaultNumProducts" className="text-right text-sm font-medium">
                    Default Number of Products
                  </label>
                  <div className="col-span-3">
                    <NumberInput
                      id="defaultNumProducts"
                      value={defaultNumProducts}
                      onChange={setDefaultNumProducts}
                      min={1}
                      className="w-[100px]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleUpdateDefaultNumProducts} disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Default"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <DefaultExtraCosts />
          
          <DefaultSavings />
        </TabsContent>
        
        <TabsContent value="production" className="space-y-6">
          <ProductionStepsTable />
        </TabsContent>
        
        <TabsContent value="customfields" className="space-y-6">
          <CustomFieldsTab />
        </TabsContent>
        
        <TabsContent value="libraries" className="space-y-6">
          <div className="pb-4">
            <h2 className="text-xl font-semibold mb-2">Component Libraries</h2>
            <p className="text-muted-foreground">Manage your organization's reusable components for quotes and projects</p>
          </div>
          <SavingsTable />
          <ExtraCostsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
