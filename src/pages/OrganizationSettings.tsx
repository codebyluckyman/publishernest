
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

export default function OrganizationSettings() {
  const { currentOrganization, updateOrganizationSetting } = useOrganization();
  const [orgName, setOrgName] = useState(currentOrganization?.name || "");
  const [defaultNumProducts, setDefaultNumProducts] = useState(currentOrganization?.default_num_products || 1);
  const [isUpdating, setIsUpdating] = useState(false);

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

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="units">Units of Measure</TabsTrigger>
          <TabsTrigger value="defaults">Default Values</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
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

        <TabsContent value="members" className="space-y-6 mt-6">
          <OrganizationMembersTable />
        </TabsContent>

        <TabsContent value="units" className="space-y-6 mt-6">
          <UnitOfMeasuresTable />
        </TabsContent>

        <TabsContent value="defaults" className="space-y-6 mt-6">
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
      </Tabs>
    </div>
  );
}
