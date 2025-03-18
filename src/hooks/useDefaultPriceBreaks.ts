
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchOrganizationDefaultPriceBreaks, updateOrganizationDefaultPriceBreaks } from "@/api/organizations/defaultPriceBreaks";
import { Organization } from "@/types/organization";
import { toast } from "sonner";

export function useDefaultPriceBreaks(organization: Organization | null) {
  const queryClient = useQueryClient();
  const organizationId = organization?.id;

  // Query to fetch default price breaks
  const defaultPriceBreaksQuery = useQuery({
    queryKey: ["defaultPriceBreaks", organizationId],
    queryFn: () => organizationId ? fetchOrganizationDefaultPriceBreaks(organizationId) : Promise.resolve([]),
    enabled: !!organizationId
  });

  // Mutation to update default price breaks
  const updateDefaultPriceBreaksMutation = useMutation({
    mutationFn: (priceBreaks: { quantity: number }[]) => {
      if (!organizationId) {
        throw new Error("No organization selected");
      }
      return updateOrganizationDefaultPriceBreaks(organizationId, priceBreaks);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["defaultPriceBreaks", organizationId] });
      toast.success("Default price breaks updated successfully");
    },
    onError: (error) => {
      console.error("Error updating default price breaks:", error);
      toast.error("Failed to update default price breaks");
    }
  });

  return {
    defaultPriceBreaks: defaultPriceBreaksQuery.data || [],
    isLoading: defaultPriceBreaksQuery.isLoading,
    isError: defaultPriceBreaksQuery.isError,
    updateDefaultPriceBreaks: updateDefaultPriceBreaksMutation.mutate,
    isUpdating: updateDefaultPriceBreaksMutation.isPending
  };
}
