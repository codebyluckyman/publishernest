import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "./useOrganization";

export interface FormatOption {
  value: string;
  label: string;
}

export interface FormatForSelect {
  id: string;
  format_name: string;
}

const { currentOrganization: orgFromContext } = useOrganization();
const currentOrganization = orgFromContext;

// Add this logging
console.log("🔍 useFormatsForSelect - Current Organization:", currentOrganization);

export function useFormatsForSelect() {

  const query = useQuery({
    queryKey: ["formats-for-select", currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) {
        console.log("❌ useFormatsForSelect - No organization, returning empty array");
        return [];
      }

      try {
        console.log("📡 useFormatsForSelect - Fetching formats for org:", currentOrganization.id);
        
        const { data, error } = await supabase
          .from("formats")
          .select("id, format_name")
          .eq("organization_id", currentOrganization.id)
          .order("format_name", { ascending: true });

        if (error) {
          console.error("❌ useFormatsForSelect - Error fetching formats:", error);
          return [];
        }

        console.log("📊 useFormatsForSelect - Raw data from Supabase:", data);

        // Transform data to include both original data and FormatOption format
        const transformedData = Array.isArray(data)
          ? data.map((format) => ({
              id: format.id,
              format_name: format.format_name,
              value: format.id,
              label: format.format_name,
            }))
          : [];

        console.log("✅ useFormatsForSelect - Transformed data:", transformedData);
        return transformedData;
      } catch (err) {
        console.error("💥 useFormatsForSelect - Exception fetching formats:", err);
        return [];
      }
    },
    enabled: !!currentOrganization,
    // enabled: true,
    initialData: [],
    staleTime: 5 * 60 * 1000,
  });

  // Add this logging for the final result
  console.log("📤 useFormatsForSelect - Returning:", {
    formats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error
  });

  return {
    formats: query.data,
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
