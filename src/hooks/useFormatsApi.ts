
import { useFormatQuery, useFormatById, Format } from "./format/useFormatQuery";
import { useFormatComponents, FormatComponent } from "./format/useFormatComponents";
import { useFormatMutations, FormatFormData } from "./format/useFormatMutations";
import { Organization } from "@/types/organization";

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
  const getFormatById = async (formatId: string): Promise<Format | null> => {
    const { data } = useFormatById(formatId);
    return data || null;
  };

  // Function to get format components
  const getFormatComponents = async (formatId: string): Promise<FormatComponent[]> => {
    const { data } = useFormatComponents(formatId);
    return data || [];
  };

  // Function to fetch formats with dynamic parameters
  const fetchFormats = async (params: FormatApiOptions): Promise<Format[]> => {
    const { data } = useFormatQuery(params);
    return data || [];
  };

  return {
    getFormatById,
    getFormatComponents,
    createFormat,
    updateFormat,
    deleteFormat,
    fetchFormats,
    formats,
    isLoading,
    error,
    refetch
  };
}
