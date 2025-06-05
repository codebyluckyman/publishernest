
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  fetchPublishingPrograms,
  createPublishingProgram,
  fetchProgramFormats,
  fetchProgramTitles
} from '@/api/publishingPrograms';
import { CreatePublishingProgramInput } from '@/types/publishingProgram';

export const usePublishingPrograms = () => {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const programsQuery = useQuery({
    queryKey: ['publishing-programs', currentOrganization?.id],
    queryFn: () => fetchPublishingPrograms(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
  });

  const createProgramMutation = useMutation({
    mutationFn: (input: CreatePublishingProgramInput) =>
      createPublishingProgram(input, currentOrganization!.id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishing-programs'] });
      toast.success('Publishing program created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create program: ${error.message}`);
    },
  });

  return {
    programs: programsQuery.data || [],
    isLoading: programsQuery.isLoading,
    error: programsQuery.error,
    createProgram: createProgramMutation.mutate,
    isCreating: createProgramMutation.isPending,
  };
};

export const useProgramFormats = (programId: string) => {
  return useQuery({
    queryKey: ['program-formats', programId],
    queryFn: () => fetchProgramFormats(programId),
    enabled: !!programId,
  });
};

export const useProgramTitles = (programFormatId: string) => {
  return useQuery({
    queryKey: ['program-titles', programFormatId],
    queryFn: () => fetchProgramTitles(programFormatId),
    enabled: !!programFormatId,
  });
};
