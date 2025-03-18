
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";

export interface FormatForSelect {
  id: string;
  format_name: string;
}

export function useFormatsForSelect(currentOrganization: Organization | null) {
  return useQuery({
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

        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("Exception fetching formats:", err);
        return [];
      }
    },
    enabled: !!currentOrganization,
    initialData: [], // Always provide empty array as initial data
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to improve performance
  });
}
