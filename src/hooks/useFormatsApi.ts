
import { Organization } from "@/types/organization";
import { useFormatQuery, useFormatById, Format } from "./format/useFormatQuery";
import { useFormatComponents, FormatComponent } from "./format/useFormatComponents";
import { useFormatMutations, FormatFormData } from "./format/useFormatMutations";

interface FormatApiOptions {
  currentOrganization: Organization | null;
  searchQuery?: string;
  filters?: Record<string, any>;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  refreshTrigger?: number;
}

export function useFormatsApi(options?: FormatApiOptions) {
  const queryParams = options || { currentOrganization: null };
  const { data: formats = [], isLoading, error, refetch } = useFormatQuery(queryParams);
  const { createFormat, updateFormat, deleteFormat } = useFormatMutations();

  // Function to get format by ID
  const getFormatById = (formatId: string) => {
    return useFormatById(formatId);
  };

  // Function to get format components
  const getFormatComponents = (formatId: string) => {
    return useFormatComponents(formatId);
  };

  return {
    formats,
    isLoading,
    error,
    refetch,
    getFormatById,
    getFormatComponents,
    createFormat,
    updateFormat,
    deleteFormat
  };
}
