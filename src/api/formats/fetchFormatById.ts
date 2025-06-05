
import { supabase } from "@/integrations/supabase/client";
import { Format } from "@/types/format";

export async function fetchFormatById(id: string): Promise<Format | null> {
  try {
    const { data, error } = await supabase
      .from("formats")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error("Error fetching format by ID:", error);
    throw error;
  }
}
