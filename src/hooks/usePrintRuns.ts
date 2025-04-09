
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchPrintRuns,
  fetchPrintRunById, 
  createPrintRun, 
  updatePrintRun, 
  deletePrintRun 
} from '@/api/printRuns';
import { useOrganization } from './useOrganization';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function usePrintRuns(status?: string) {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  
  const printRunsQuery = useQuery({
    queryKey: ['printRuns', currentOrganization?.id, status],
    queryFn: () => {
      if (!currentOrganization) return Promise.resolve([]);
      return fetchPrintRuns({ 
        organizationId: currentOrganization.id,
        status 
      });
    },
    enabled: !!currentOrganization,
  });

  const createPrintRunMutation = useMutation({
    mutationFn: createPrintRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printRuns'] });
      toast.success('Print run created successfully');
    },
    onError: (error) => {
      toast.error(`Error creating print run: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const updatePrintRunMutation = useMutation({
    mutationFn: updatePrintRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printRuns'] });
      toast.success('Print run updated successfully');
    },
    onError: (error) => {
      toast.error(`Error updating print run: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const deletePrintRunMutation = useMutation({
    mutationFn: deletePrintRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printRuns'] });
      toast.success('Print run deleted successfully');
    },
    onError: (error) => {
      toast.error(`Error deleting print run: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  return {
    printRuns: printRunsQuery.data || [],
    isLoading: printRunsQuery.isLoading,
    isError: printRunsQuery.isError,
    error: printRunsQuery.error,
    createPrintRun: createPrintRunMutation.mutate,
    updatePrintRun: updatePrintRunMutation.mutate,
    deletePrintRun: deletePrintRunMutation.mutate,
  };
}

export function usePrintRunDetails(id?: string) {
  return useQuery({
    queryKey: ['printRun', id],
    queryFn: () => {
      if (!id) return Promise.resolve(null);
      return fetchPrintRunById(id);
    },
    enabled: !!id,
  });
}
