
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from './useOrganization';

export interface FormatOption {
  value: string;
  label: string;
}

export function useFormatsForSelect() {
  const { currentOrganization } = useOrganization();
  
  const query = useQuery({
    queryKey: ["formats-for-select", currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return [];

      try {
        const { data, error } = await supabase
          .from("formats")
          .select("id, format_name")
          .eq("organization_id", currentOrganization.id)
          .order("format_name", { ascending: true });

        if (error) {
          console.error("Error fetching formats:", error);
          return [];
        }

        return Array.isArray(data) 
          ? data.map(format => ({ 
              value: format.id, 
              label: format.format_name 
            }))
          : [];
      } catch (err) {
        console.error("Exception fetching formats:", err);
        return [];
      }
    },
    enabled: !!currentOrganization,
    initialData: [], // Always provide empty array as initial data
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to improve performance
  });

  return {
    formats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error
  };
}
