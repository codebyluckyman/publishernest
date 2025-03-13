
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Format, FormatCategory } from "@/types/format";
import { 
  createFormat, 
  updateFormat, 
  deleteFormat,
  createFormatCategory,
  updateFormatCategory,
  deleteFormatCategory
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

  /**
   * Create a new format category
   */
  const useCreateFormatCategory = () => {
    return useMutation({
      mutationFn: (categoryData: { name: string; organization_id: string }) => 
        createFormatCategory(categoryData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["formatCategories"] });
        toast.success("Category created successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create category");
      }
    });
  };

  /**
   * Update an existing format category
   */
  const useUpdateFormatCategory = () => {
    return useMutation({
      mutationFn: ({ id, name }: { id: string; name: string }) => 
        updateFormatCategory(id, name),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["formatCategories"] });
        toast.success("Category updated successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update category");
      }
    });
  };

  /**
   * Delete a format category
   */
  const useDeleteFormatCategory = () => {
    return useMutation({
      mutationFn: (id: string) => deleteFormatCategory(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["formatCategories"] });
        toast.success("Category deleted successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete category");
      }
    });
  };

  return {
    useCreateFormat,
    useUpdateFormat,
    useDeleteFormat,
    useCreateFormatCategory,
    useUpdateFormatCategory,
    useDeleteFormatCategory
  };
}
