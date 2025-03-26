
import { supabase } from "@/integrations/supabase/client";
import { OrganizationProductionStep } from "@/types/organization";

export async function fetchProductionSteps(organizationId: string): Promise<OrganizationProductionStep[]> {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const { data, error } = await supabase
    .from("organization_production_steps")
    .select("*")
    .eq("organization_id", organizationId)
    .order("order_number", { ascending: true });

  if (error) {
    console.error("Error fetching production steps:", error);
    throw new Error("Failed to fetch production steps");
  }

  return data || [];
}
