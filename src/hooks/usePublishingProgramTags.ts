
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from 'sonner';
import {
  fetchOrganizationTags,
  createOrganizationTag,
  incrementTagUsage,
  getTagSuggestions,
  OrganizationTag
} from '@/api/publishingProgramTags';
import { ProgramTag } from '@/types/publishingProgram';

export const useOrganizationTags = () => {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  const tagsQuery = useQuery({
    queryKey: ['organization-tags', currentOrganization?.id],
    queryFn: () => fetchOrganizationTags(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
  });

  const createTagMutation = useMutation({
    mutationFn: (tag: ProgramTag) => {
      if (!currentOrganization) {
        throw new Error('No organization selected');
      }
      return createOrganizationTag(currentOrganization.id, tag);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-tags'] });
    },
    onError: (error: Error) => {
      console.error('Create tag error:', error);
      toast.error(`Failed to create tag: ${error.message}`);
    },
  });

  const incrementUsageMutation = useMutation({
    mutationFn: incrementTagUsage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-tags'] });
    },
  });

  return {
    tags: tagsQuery.data || [],
    isLoading: tagsQuery.isLoading,
    error: tagsQuery.error,
    createTag: createTagMutation.mutateAsync,
    incrementUsage: incrementUsageMutation.mutateAsync,
    isCreatingTag: createTagMutation.isPending,
  };
};

export const useTagSuggestions = (searchTerm: string) => {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['tag-suggestions', currentOrganization?.id, searchTerm],
    queryFn: () => getTagSuggestions(currentOrganization!.id, searchTerm),
    enabled: !!currentOrganization?.id && searchTerm.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
