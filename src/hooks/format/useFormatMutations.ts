
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Format } from "./useFormatQuery";

export interface FormatFormData {
  id?: string;
  format_name: string;
  organization_id?: string;
  [key: string]: any;
}

export function useFormatMutations() {
  const queryClient = useQueryClient();

  // Create a new format
  const createFormat = useMutation({
    mutationFn: async (formatData: FormatFormData) => {
      try {
        const { data, error } = await supabase
          .from("formats")
          .insert(formatData)
          .select()
          .single();

        if (error) throw error;
        return data as Format;
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

  // Update an existing format
  const updateFormat = useMutation({
    mutationFn: async ({ id, ...updateData }: FormatFormData & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from("formats")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data as Format;
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

  // Delete a format
  const deleteFormat = useMutation({
    mutationFn: async (id: string) => {
      try {
        // First delete format components
        await supabase
          .from("format_components")
          .delete()
          .eq("format_id", id);

        // Then delete the format
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

  return {
    createFormat,
    updateFormat,
    deleteFormat
  };
}
