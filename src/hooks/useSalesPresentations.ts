
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from './useOrganization';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/utils/toast-utils';
import { 
  fetchSalesPresentations, 
  fetchSalesPresentationById,
  createSalesPresentation,
  updateSalesPresentation,
  deleteSalesPresentation,
  publishSalesPresentation,
  createPresentationShare
} from '@/api/salesPresentations';

export function useSalesPresentations() {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all presentations
  const usePresentations = (status?: string, limit?: number, page?: number) => {
    return useQuery({
      queryKey: ['salesPresentations', currentOrganization?.id, status, limit, page],
      queryFn: () => 
        fetchSalesPresentations({ 
          currentOrganization: currentOrganization!, 
          status, 
          limit, 
          page 
        }),
      enabled: !!currentOrganization?.id,
    });
  };

  // Fetch a single presentation by ID
  const usePresentation = (id?: string) => {
    return useQuery({
      queryKey: ['salesPresentation', id],
      queryFn: () => fetchSalesPresentationById(id!),
      enabled: !!id,
    });
  };

  // Create a new presentation
  const createPresentation = async ({ 
    title, 
    description, 
    coverImageUrl,
    displayColumns
  }: { 
    title: string, 
    description?: string, 
    coverImageUrl?: string,
    displayColumns?: Array<"price" | "isbn13" | "publisher" | "publication_date" | "format">
  }) => {
    if (!currentOrganization || !user) {
      throw new Error('Missing organization or user information');
    }

    const displaySettings = displayColumns ? { displayColumns } : undefined;

    const result = await createSalesPresentation({
      title,
      description,
      currentOrganization,
      userId: user.id,
      coverImageUrl,
      displaySettings
    });

    if (!result) {
      throw new Error('Failed to create presentation');
    }

    // Invalidate presentations query
    queryClient.invalidateQueries({ queryKey: ['salesPresentations'] });
    
    return result;
  };

  // Create mutation
  const useCreatePresentation = () => {
    return useMutation({
      mutationFn: createPresentation,
      onSuccess: () => {
        toast.success('Presentation created successfully');
      },
      onError: (error) => {
        toast.error('Failed to create presentation');
        console.error('Create presentation error:', error);
      }
    });
  };

  // Update a presentation
  const updatePresentation = async ({ 
    id, 
    ...updateData 
  }: { 
    id: string, 
    title?: string, 
    description?: string, 
    status?: 'draft' | 'published' | 'archived',
    coverImageUrl?: string,
    expiresAt?: string
  }) => {
    const result = await updateSalesPresentation({
      id,
      ...updateData
    });

    if (!result) {
      throw new Error('Failed to update presentation');
    }

    // Invalidate specific presentation query
    queryClient.invalidateQueries({ queryKey: ['salesPresentation', id] });
    // Also invalidate the presentations list
    queryClient.invalidateQueries({ queryKey: ['salesPresentations'] });
    
    return result;
  };

  // Update mutation
  const useUpdatePresentation = () => {
    return useMutation({
      mutationFn: updatePresentation,
      onSuccess: () => {
        toast.success('Presentation updated successfully');
      },
      onError: (error) => {
        toast.error('Failed to update presentation');
        console.error('Update presentation error:', error);
      }
    });
  };

  // Delete a presentation
  const deletePresentation = async (id: string) => {
    const result = await deleteSalesPresentation(id);

    if (!result) {
      throw new Error('Failed to delete presentation');
    }

    // Invalidate presentations query
    queryClient.invalidateQueries({ queryKey: ['salesPresentations'] });
    
    return result;
  };

  // Delete mutation
  const useDeletePresentation = () => {
    return useMutation({
      mutationFn: deletePresentation,
      onSuccess: () => {
        toast.success('Presentation deleted successfully');
      },
      onError: (error) => {
        toast.error('Failed to delete presentation');
        console.error('Delete presentation error:', error);
      }
    });
  };

  // Publish a presentation
  const publish = async ({ 
    id, 
    expiresAt 
  }: { 
    id: string, 
    expiresAt?: string 
  }) => {
    const result = await publishSalesPresentation({
      id,
      expiresAt
    });

    if (!result) {
      throw new Error('Failed to publish presentation');
    }

    // Invalidate specific presentation query
    queryClient.invalidateQueries({ queryKey: ['salesPresentation', id] });
    // Also invalidate the presentations list
    queryClient.invalidateQueries({ queryKey: ['salesPresentations'] });
    
    return result;
  };

  // Publish mutation
  const usePublishPresentation = () => {
    return useMutation({
      mutationFn: publish,
      onSuccess: () => {
        toast.success('Presentation published successfully');
      },
      onError: (error) => {
        toast.error('Failed to publish presentation');
        console.error('Publish presentation error:', error);
      }
    });
  };

  // Create share link
  const sharePresentation = async ({ 
    presentationId, 
    sharedWith, 
    expiresAt 
  }: { 
    presentationId: string, 
    sharedWith?: string, 
    expiresAt?: string 
  }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const result = await createPresentationShare({
      presentationId,
      sharedBy: user.id,
      sharedWith,
      expiresAt
    });

    if (!result) {
      throw new Error('Failed to create share link');
    }
    
    return result;
  };

  // Share mutation
  const useSharePresentation = () => {
    return useMutation({
      mutationFn: sharePresentation,
      onSuccess: () => {
        toast.success('Share link created successfully');
      },
      onError: (error) => {
        toast.error('Failed to create share link');
        console.error('Share presentation error:', error);
      }
    });
  };

  return {
    usePresentations,
    usePresentation,
    useCreatePresentation,
    useUpdatePresentation,
    useDeletePresentation,
    usePublishPresentation,
    useSharePresentation
  };
}
