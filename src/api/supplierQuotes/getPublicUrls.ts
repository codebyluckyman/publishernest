
import { supabase } from "@/integrations/supabase/client";

export async function getPublicUrl(bucket: string, filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

  if (error) {
    console.error("Error creating signed URL:", error);
    throw error;
  }

  return data.signedUrl;
}
