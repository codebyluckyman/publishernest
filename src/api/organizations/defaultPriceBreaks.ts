
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches default price breaks for an organization
 */
export async function fetchOrganizationDefaultPriceBreaks(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from("organization_default_price_breaks")
      .select("*")
      .eq("organization_id", organizationId)
      .order("quantity", { ascending: true });

    if (error) {
      console.error("Error fetching default price breaks:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchOrganizationDefaultPriceBreaks:", error);
    throw error;
  }
}

/**
 * Updates default price breaks for an organization
 * Replaces all existing price breaks with the new ones
 */
export async function updateOrganizationDefaultPriceBreaks(
  organizationId: string,
  priceBreaks: { quantity: number }[]
) {
  try {
    // Delete existing price breaks
    const { error: deleteError } = await supabase
      .from("organization_default_price_breaks")
      .delete()
      .eq("organization_id", organizationId);

    if (deleteError) {
      console.error("Error deleting existing price breaks:", deleteError);
      throw deleteError;
    }

    // If no price breaks to add, return
    if (!priceBreaks.length) {
      return [];
    }

    // Insert new price breaks
    const priceBreakEntries = priceBreaks.map((break_) => ({
      organization_id: organizationId,
      quantity: break_.quantity
    }));

    const { data, error: insertError } = await supabase
      .from("organization_default_price_breaks")
      .insert(priceBreakEntries)
      .select();

    if (insertError) {
      console.error("Error inserting price breaks:", insertError);
      throw insertError;
    }

    return data || [];
  } catch (error) {
    console.error("Error in updateOrganizationDefaultPriceBreaks:", error);
    throw error;
  }
}
