
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  fetchPublishingPrograms,
  createPublishingProgram,
  fetchProgramFormats,
  fetchProgramTitles,
  createProgramFormat,
  createProgramTitle,
  deleteProgramFormat,
  deleteProgramTitle
} from '@/api/publishingPrograms';
import { CreatePublishingProgramInput, CreateProgramFormatInput, CreateProgramTitleInput } from '@/types/publishingProgram';

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
  const queryClient = useQueryClient();

  const formatsQuery = useQuery({
    queryKey: ['program-formats', programId],
    queryFn: () => fetchProgramFormats(programId),
    enabled: !!programId,
  });

  const createFormatMutation = useMutation({
    mutationFn: createProgramFormat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-formats', programId] });
      toast.success('Format added to program successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add format: ${error.message}`);
    },
  });

  const deleteFormatMutation = useMutation({
    mutationFn: deleteProgramFormat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-formats', programId] });
      toast.success('Format removed from program successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove format: ${error.message}`);
    },
  });

  return {
    data: formatsQuery.data || [],
    isLoading: formatsQuery.isLoading,
    error: formatsQuery.error,
    createFormat: createFormatMutation.mutate,
    isCreatingFormat: createFormatMutation.isPending,
    deleteFormat: deleteFormatMutation.mutate,
    isDeletingFormat: deleteFormatMutation.isPending,
  };
};

export const useProgramTitles = (programFormatId: string) => {
  const queryClient = useQueryClient();

  const titlesQuery = useQuery({
    queryKey: ['program-titles', programFormatId],
    queryFn: () => fetchProgramTitles(programFormatId),
    enabled: !!programFormatId,
  });

  const createTitleMutation = useMutation({
    mutationFn: createProgramTitle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-titles', programFormatId] });
      toast.success('Title added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add title: ${error.message}`);
    },
  });

  const deleteTitleMutation = useMutation({
    mutationFn: deleteProgramTitle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-titles', programFormatId] });
      toast.success('Title deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete title: ${error.message}`);
    },
  });

  return {
    titles: titlesQuery.data || [],
    isLoading: titlesQuery.isLoading,
    error: titlesQuery.error,
    createTitle: createTitleMutation.mutate,
    isCreatingTitle: createTitleMutation.isPending,
    deleteTitle: deleteTitleMutation.mutate,
    isDeletingTitle: deleteTitleMutation.isPending,
  };
};
