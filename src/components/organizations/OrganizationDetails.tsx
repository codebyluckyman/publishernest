
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building, Upload, X } from "lucide-react";
import { Organization } from "@/types/organization";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrganizationDetailsProps {
  organization: Organization;
  onOrganizationUpdate?: (updatedOrg: Organization) => void;
}

export const OrganizationDetails = ({ 
  organization, 
  onOrganizationUpdate 
}: OrganizationDetailsProps) => {
  const [uploading, setUploading] = useState(false);
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${organization.id}-logo.${fileExt}`;
    const filePath = `${organization.id}/${fileName}`;
    
    console.log("start uploading")
    setUploading(true);
    
    try {
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase
        .storage
        .from('organization-logos')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL of the uploaded file
      const { data } = supabase
        .storage
        .from('organization-logos')
        .getPublicUrl(filePath);
      
      // Update the organization record with the logo URL
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ logo_url: data.publicUrl })
        .eq('id', organization.id);
      
      if (updateError) throw updateError;
      
      // Notify parent component about the update
      if (onOrganizationUpdate) {
        onOrganizationUpdate({
          ...organization,
          logo_url: data.publicUrl
        });
      }
      
      toast.success("Organization logo updated successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload organization logo");
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = async () => {
    try {
      // Update the organization record to remove the logo URL
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ logo_url: null })
        .eq('id', organization.id);
      
      if (updateError) throw updateError;
      
      // Notify parent component about the update
      if (onOrganizationUpdate) {
        onOrganizationUpdate({
          ...organization,
          logo_url: null
        });
      }
      
      toast.success("Organization logo removed");
    } catch (error) {
      console.error("Error removing logo:", error);
      toast.error("Failed to remove organization logo");
    }
  };

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
          <div className="flex flex-col items-center mb-4">
            {organization.logo_url ? (
              <div className="relative mb-2">
                <img 
                  src={organization.logo_url} 
                  alt={`${organization.name} logo`} 
                  className="h-24 w-24 object-contain rounded-md"
                />
                <Button 
                  size="icon"
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full" 
                  onClick={removeLogo}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="h-24 w-24 bg-gray-100 flex items-center justify-center rounded-md mb-2">
                <Building className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            <div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={uploading}
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <Upload className="h-3 w-3" />
                {uploading ? "Uploading..." : "Upload Logo"}
              </Button>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Organization Name</label>
            <Input value={organization.name} disabled />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Organization Slug</label>
            <Input value={organization.slug} disabled />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
