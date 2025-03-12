
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

      const { data, error } = await supabase
        .from("formats")
        .select("id, format_name")
        .eq("organization_id", currentOrganization.id)
        .order("format_name", { ascending: true });

      if (error) throw error;

      return data as FormatForSelect[];
    },
    enabled: !!currentOrganization,
  });
}
