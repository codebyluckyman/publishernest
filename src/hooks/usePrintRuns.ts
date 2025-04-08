
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { PrintRun, PrintRunFormValues } from "@/types/printRun";
import { useOrganization } from "@/context/OrganizationContext";

export function usePrintRuns() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  /**
   * Hook to fetch print runs
   */
  const usePrintRunsList = (
    status?: string,
    searchQuery?: string
  ) => {
    return useQuery({
      queryKey: ["printRuns", currentOrganization?.id, status, searchQuery],
      queryFn: async () => {
        if (!currentOrganization) return [];

        let query = supabase
          .from("print_runs")
          .select("*")
          .eq("organization_id", currentOrganization.id);

        if (status) {
          query = query.eq("status", status);
        }

        if (searchQuery) {
          query = query.ilike("title", `%${searchQuery}%`);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) throw error;
        return data as PrintRun[];
      },
      enabled: !!currentOrganization,
    });
  };

  /**
   * Hook to fetch a specific print run by ID
   */
  const usePrintRunById = (id: string | null) => {
    return useQuery({
      queryKey: ["printRun", id],
      queryFn: async () => {
        if (!id) throw new Error("Print run ID is required");

        const { data, error } = await supabase
          .from("print_runs")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        return data as PrintRun;
      },
      enabled: !!id,
    });
  };

  /**
   * Hook to create a new print run
   */
  const useCreatePrintRun = () => {
    return useMutation({
      mutationFn: async (formData: PrintRunFormValues) => {
        if (!user || !currentOrganization) {
          throw new Error("User must be authenticated and organization selected");
        }

        const { data, error } = await supabase
          .from("print_runs")
          .insert({
            organization_id: currentOrganization.id,
            title: formData.title,
            description: formData.description || null,
            status: formData.status || "draft",
            created_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data as PrintRun;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["printRuns"] });
        toast.success("Print run created successfully");
      },
      onError: (error: any) => {
        console.error("Error creating print run:", error);
        toast.error(error.message || "Failed to create print run");
      },
    });
  };

  /**
   * Hook to update a print run
   */
  const useUpdatePrintRun = () => {
    return useMutation({
      mutationFn: async ({ id, updates }: { id: string; updates: Partial<PrintRunFormValues> }) => {
        if (!id) throw new Error("Print run ID is required");

        const { data, error } = await supabase
          .from("print_runs")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data as PrintRun;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["printRuns"] });
        queryClient.invalidateQueries({ queryKey: ["printRun", variables.id] });
        toast.success("Print run updated successfully");
      },
      onError: (error: any) => {
        console.error("Error updating print run:", error);
        toast.error(error.message || "Failed to update print run");
      },
    });
  };

  /**
   * Hook to delete a print run
   */
  const useDeletePrintRun = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        if (!id) throw new Error("Print run ID is required");

        const { error } = await supabase
          .from("print_runs")
          .delete()
          .eq("id", id);

        if (error) throw error;
        return id;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["printRuns"] });
        toast.success("Print run deleted successfully");
      },
      onError: (error: any) => {
        console.error("Error deleting print run:", error);
        toast.error(error.message || "Failed to delete print run");
      },
    });
  };

  return {
    usePrintRunsList,
    usePrintRunById,
    useCreatePrintRun,
    useUpdatePrintRun,
    useDeletePrintRun,
  };
}
