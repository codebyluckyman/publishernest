
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";
import { toast } from "sonner";

// Basic Format type
export interface Format {
  id: string;
  format_name: string;
  organization_id: string;
  extent?: string;
  extent_pages?: number;
  cover_stock_print?: string;
  internal_stock_print?: string;
  tps_height_mm?: number;
  tps_width_mm?: number;
  tps_depth_mm?: number;
  tps_plc_height_mm?: number;
  tps_plc_width_mm?: number;
  tps_plc_depth_mm?: number;
  created_at?: string;
  updated_at?: string;
  binding_type?: string;
  cover_material?: string;
  internal_material?: string;
}

export interface FormatQueryParams {
  currentOrganization: Organization | null;
  searchQuery?: string;
  filters?: Record<string, any>;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  refreshTrigger?: number;
}

export function useFormatQuery({
  currentOrganization,
  searchQuery = "",
  filters = {},
  sortField = "format_name",
  sortDirection = "asc",
  refreshTrigger = 0,
}: FormatQueryParams) {
  return useQuery({
    queryKey: [
      "formats",
      currentOrganization?.id,
      searchQuery,
      filters,
      sortField,
      sortDirection,
      refreshTrigger,
    ],
    queryFn: async () => {
      if (!currentOrganization) return [] as Format[];

      let query = supabase
        .from("formats")
        .select("*")
        .eq("organization_id", currentOrganization.id)
        .order(sortField, { ascending: sortDirection === "asc" });

      if (searchQuery) {
        query = query.ilike("format_name", `%${searchQuery}%`);
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as Format[];
    },
    enabled: !!currentOrganization,
  });
}

// Fetch a single format by ID
export const useFormatById = (formatId?: string | null) => {
  return useQuery({
    queryKey: ["format", formatId],
    queryFn: async () => {
      if (!formatId) return null;
      
      try {
        const { data, error } = await supabase
          .from("formats")
          .select("*")
          .eq("id", formatId)
          .single();

        if (error) throw error;
        return data as Format;
      } catch (error: any) {
        console.error("Error fetching format:", error);
        toast.error("Error fetching format details");
        return null;
      }
    },
    enabled: !!formatId,
  });
};
