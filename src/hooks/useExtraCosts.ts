
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { ExtraCostTableItem } from "@/types/extraCost";

export const useExtraCosts = () => {
  const { currentOrganization } = useOrganization();

  const { data: extraCosts, isLoading, error } = useQuery({
    queryKey: ["extraCosts", currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return [];

      const { data, error } = await supabase
        .from("extra_costs")
        .select("*")
        .eq("organization_id", currentOrganization.id)
        .order("name");

      if (error) throw error;
      return data as ExtraCostTableItem[];
    },
    enabled: !!currentOrganization,
  });

  return {
    extraCosts: extraCosts || [],
    isLoading,
    error,
  };
};
