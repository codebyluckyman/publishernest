
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Format } from "@/types/format";
import { Organization } from "@/types/organization";
import { createFormat, updateFormat, deleteFormat, fetchFormats } from "@/api/formats";
import { useAuth } from "@/context/AuthContext";
import { PageSize } from "./usePagination";

export function useFormats() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const useFormatsList = (
    organizationId: string,
    search?: string,
    sort: string = 'format_name',
    order: 'asc' | 'desc' = 'asc',
    page: number = 0,
    pageSize: PageSize = 10
  ) => {
    return useQuery({
      queryKey: ["formats", organizationId, search, sort, order, page, pageSize],
      queryFn: () => fetchFormats(organizationId, search, sort, order, page, pageSize),
      enabled: !!organizationId,
    });
  };

  const useFormatById = (formatId: string) => {
    return useQuery({
      queryKey: ["format", formatId],
      queryFn: async () => {
        if (!formatId) return null;
        // This would need to be implemented in the API
        // For now, we'll return null as this is just for the format name
        return null;
      },
      enabled: !!formatId,
    });
  };

  const useCreateFormat = () => {
    return useMutation({
      mutationFn: (formatData: Omit<Format, "id" | "created_at" | "updated_at">) => {
        return createFormat(formatData);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["formats"] });
        toast.success("Format created successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create format");
      },
    });
  };

  const useUpdateFormat = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Format> }) => {
        return updateFormat(id, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["formats"] });
        toast.success("Format updated successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update format");
      },
    });
  };

  const useDeleteFormat = () => {
    return useMutation({
      mutationFn: (id: string) => {
        return deleteFormat(id);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["formats"] });
        toast.success("Format deleted successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete format");
      },
    });
  };

  return {
    useFormatsList,
    useFormatById,
    useCreateFormat,
    useUpdateFormat,
    useDeleteFormat,
  };
}
