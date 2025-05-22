
import { supabase } from "@/integrations/supabase/client";

/**
 * Get a public URL for a file stored in Supabase storage
 * 
 * @param bucket - The storage bucket name
 * @param fileKey - The file key within the bucket
 * @returns A public URL for the file
 */
export async function getPublicUrl(bucket: string, fileKey: string): Promise<string> {
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileKey);
    
    if (!data || !data.publicUrl) {
      throw new Error(`Failed to generate public URL for file: ${fileKey}`);
    }
    
    return data.publicUrl;
  } catch (error) {
    console.error("Error generating public URL:", error);
    throw new Error(`Failed to get public URL: ${error}`);
  }
}
