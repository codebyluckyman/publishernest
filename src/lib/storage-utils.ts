
import { supabase } from "@/integrations/supabase/client";

export const ensureOrganizationLogosBucket = async (): Promise<boolean> => {
  try {
    // First check if the bucket already exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'organization-logos');
    
    if (bucketExists) {
      return true;
    }
    
    // If bucket doesn't exist, call the edge function to create it
    const { error } = await supabase.functions.invoke('create-organization-logos-bucket');
    
    if (error) {
      console.error('Error creating organization-logos bucket:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking/creating organization-logos bucket:', error);
    return false;
  }
};
