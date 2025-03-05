
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building } from "lucide-react";
import { Organization } from "@/context/OrganizationContext";

interface OrganizationDetailsProps {
  organization: Organization;
}

export const OrganizationDetails = ({ organization }: OrganizationDetailsProps) => {
  return (
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
          <Input value={organization.name} disabled />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Organization Slug</label>
          <Input value={organization.slug} disabled />
        </div>
      </CardContent>
    </Card>
  );
};
