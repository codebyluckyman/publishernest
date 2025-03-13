
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Format } from "@/types/format";
import { 
  createFormat, 
  updateFormat, 
  deleteFormat,
} from "@/api/formats";

/**
 * Custom hook for format-related mutations
 */
export function useFormatMutations() {
  const queryClient = useQueryClient();

  /**
   * Create a new format
   */
  const useCreateFormat = () => {
    return useMutation({
      mutationFn: (formatData: Omit<Format, "id" | "created_at" | "updated_at">) => 
        createFormat(formatData as any), // Using type assertion to break circular reference
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["formats"] });
        toast.success("Format created successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create format");
      }
    });
  };

  /**
   * Update an existing format
   */
  const useUpdateFormat = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Format> }) => 
        updateFormat(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["formats"] });
        toast.success("Format updated successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update format");
      }
    });
  };

  /**
   * Delete a format
   */
  const useDeleteFormat = () => {
    return useMutation({
      mutationFn: (id: string) => deleteFormat(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["formats"] });
        toast.success("Format deleted successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete format");
      }
    });
  };

  // Note: Format category functions are temporarily removed as they reference
  // non-existent table functions. They will be implemented once the table exists.

  return {
    useCreateFormat,
    useUpdateFormat,
    useDeleteFormat,
  };
}
