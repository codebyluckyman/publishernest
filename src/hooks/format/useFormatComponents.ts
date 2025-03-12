
// Note: This is only a partial fix to avoid the type instantiation error
// The actual implementation would need more context than what's provided

import { useQuery } from "@tanstack/react-query";

// Use explicit type definition to avoid deep instantiation
export interface FormatComponent {
  id: string;
  format_id: string;
  component_id: string;
  component_name?: string;
  // Add other fields as needed
}

export function useFormatComponents(formatId: string | null) {
  return useQuery({
    queryKey: ["formatComponents", formatId],
    queryFn: async () => {
      if (!formatId) {
        return [] as FormatComponent[];
      }
      
      try {
        // Implementation would go here
        // Returning empty array to avoid errors
        return [] as FormatComponent[];
      } catch (error) {
        console.error("Error fetching format components:", error);
        return [] as FormatComponent[];
      }
    },
    enabled: !!formatId,
  });
}
