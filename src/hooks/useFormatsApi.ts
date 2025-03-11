import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Organization } from "@/types/organization";

export function useFormatsApi() {
  const queryClient = useQueryClient();

  const getFormatById = async (formatId: string) => {
    try {
      const { data: format, error } = await supabase
        .from("formats")
        .select("*")
        .eq("id", formatId)
        .single();

      if (error) throw error;
      return format;
    } catch (error: any) {
      console.error("Error fetching format:", error);
      toast.error("Error fetching format details");
      return null;
    }
  };

  const getFormatComponents = async (formatId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from("format_components")
        .select("*")
        .eq("format_id", formatId);

      if (error) {
        console.error("Error fetching format components:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching format components:", error);
      return [];
    }
  };

  const createFormat = useMutation({
    mutationFn: async (formatData: any) => {
      try {
        const { data, error } = await supabase
          .from("formats")
          .insert(formatData)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error("Error creating format:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formats"] });
      toast.success("Format created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create format: ${error.message}`);
    },
  });

  const updateFormat = useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; [key: string]: any }) => {
      try {
        const { data, error } = await supabase
          .from("formats")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error("Error updating format:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["formats"] });
      queryClient.invalidateQueries({ queryKey: ["format", data.id] });
      toast.success("Format updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update format: ${error.message}`);
    },
  });

  const deleteFormat = useMutation({
    mutationFn: async (id: string) => {
      try {
        await supabase
          .from("format_components")
          .delete()
          .eq("format_id", id);

        const { error } = await supabase
          .from("formats")
          .delete()
          .eq("id", id);

        if (error) throw error;
        return id;
      } catch (error: any) {
        console.error("Error deleting format:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formats"] });
      toast.success("Format deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete format: ${error.message}`);
    },
  });

  const fetchFormats = async (
    params: {
      currentOrganization: Organization | null;
      searchQuery: string;
      filters: Record<string, any>;
      sortField: string;
      sortDirection: "asc" | "desc";
    }
  ): Promise<any[]> => {
    const { currentOrganization, searchQuery, filters, sortField, sortDirection } = params;

    try {
      if (!currentOrganization) return [];

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

      return data || [];
    } catch (error) {
      console.error("Error fetching formats:", error);
      toast.error("Failed to load formats");
      return [];
    }
  };

  return {
    getFormatById,
    getFormatComponents,
    createFormat,
    updateFormat,
    deleteFormat,
    fetchFormats,
  };
}
