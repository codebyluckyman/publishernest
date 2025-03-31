
import { supabase } from "@/integrations/supabase/client";

export async function getPublicUrl(bucket: string, filePath: string): Promise<string> {
  try {
    // First, check if we need a signed URL
    if (bucket !== 'avatars') {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

      if (error) {
        console.error("Error creating signed URL:", error);
        throw error;
      }

      return data.signedUrl;
    } else {
      // For avatars, we can use a public URL since the bucket is public
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    }
  } catch (error) {
    console.error("Error getting URL:", error);
    throw error;
  }
}
