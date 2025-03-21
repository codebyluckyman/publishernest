
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { SavingTableItem } from "@/types/saving";

export const useSavings = () => {
  const { currentOrganization } = useOrganization();

  const { data: savings, isLoading, error } = useQuery({
    queryKey: ["savings", currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return [];

      const { data, error } = await supabase
        .from("savings")
        .select("*")
        .eq("organization_id", currentOrganization.id)
        .order("name");

      if (error) throw error;
      return data as SavingTableItem[];
    },
    enabled: !!currentOrganization,
  });

  return {
    savings: savings || [],
    isLoading,
    error,
  };
};
