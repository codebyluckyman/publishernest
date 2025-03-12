
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";

// Simplified type just for the component query
export interface BasicFormatComponent {
  id: string;
  component_name: string;
  description?: string;
}

export interface BasicFormatLink {
  id: string;
  component_id: string;
  quantity: number;
  notes?: string;
  component?: BasicFormatComponent;
}

// Function to fetch format components for a specific organization
export const useFormatComponents = (currentOrganization: Organization | null) => {
  return useQuery({
    queryKey: ["format-components", currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return [];

      const { data, error } = await supabase
        .from("format_components")
        .select("*")
        .eq("organization_id", currentOrganization.id);

      if (error) throw error;
      return data as BasicFormatComponent[];
    },
    enabled: !!currentOrganization,
  });
};

// Function to fetch linked components for a specific format
export const useLinkedComponents = (formatId: string) => {
  return useQuery({
    queryKey: ["format-linked-components", formatId],
    queryFn: async () => {
      if (!formatId) return [];

      const { data, error } = await supabase
        .from("format_component_links")
        .select(`
          *,
          component:component_id(id, component_name, description)
        `)
        .eq("format_id", formatId);

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        component: item.component as BasicFormatComponent
      })) as BasicFormatLink[];
    },
    enabled: !!formatId,
  });
};
