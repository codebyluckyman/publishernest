
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";
import { PageSize } from "@/hooks/usePagination";

export interface FormatApiOptions {
  organizationId?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: PageSize;
}

export function useFormatsApi(currentOrganization: Organization | null, options: FormatApiOptions = {}) {
  return useQuery({
    queryKey: ["formats", currentOrganization?.id, options],
    queryFn: async () => {
      if (!currentOrganization) return { data: [], total: 0 };

      // Start building query
      let query = supabase
        .from("formats")
        .select("*", { count: "exact" })
        .eq("organization_id", currentOrganization.id);

      // Apply search if provided
      if (options.search) {
        query = query.ilike("format_name", `%${options.search}%`);
      }

      // Apply sorting
      if (options.sort) {
        query = query.order(options.sort, { ascending: options.order === 'asc' });
      } else {
        query = query.order("format_name", { ascending: true });
      }

      // Apply pagination
      if (options.page !== undefined && options.pageSize) {
        const from = options.page * options.pageSize;
        query = query.range(from, from + options.pageSize - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0
      };
    },
    enabled: !!currentOrganization,
  });
}

export function useFormatDetails(formatId: string | null) {
  return useQuery({
    queryKey: ["format-details", formatId],
    queryFn: async () => {
      if (!formatId) return null;

      const { data, error } = await supabase
        .from("formats")
        .select("*")
        .eq("id", formatId)
        .single();

      if (error) throw error;

      return data;
    },
    enabled: !!formatId,
  });
}
