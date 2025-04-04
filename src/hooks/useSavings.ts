
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SavingTableItem } from "@/types/saving";
import { useOrganization } from "@/context/OrganizationContext";

export function useSavings() {
  const { currentOrganization } = useOrganization();
  
  const getSavings = async (): Promise<SavingTableItem[]> => {
    if (!currentOrganization?.id) {
      return [];
    }
    
    const { data, error } = await supabase
      .from("savings")
      .select(`
        id,
        name,
        description,
        unit_of_measure_id,
        unit_of_measures:unit_of_measure_id (
          name
        ),
        organization_id,
        created_at,
        updated_at
      `)
      .eq("organization_id", currentOrganization.id)
      .order("name");
    
    if (error) {
      console.error("Error fetching savings:", error);
      return [];
    }
    
    return data.map(item => ({
      ...item,
      unit_of_measure_name: item.unit_of_measures?.name || null
    })) as SavingTableItem[];
  };
  
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['savings', currentOrganization?.id],
    queryFn: getSavings,
    enabled: !!currentOrganization?.id
  });
  
  return {
    savings: data,
    isLoading,
    error
  };
}
