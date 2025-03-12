
import { supabase } from "@/integrations/supabase/client";

/**
 * Deletes a quote request
 */
export async function deleteQuoteRequest(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("quote_requests")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return true;
  } catch (error: any) {
    console.error("Error deleting quote request:", error);
    throw error;
  }
}
