
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchSavedViews,
  createSavedView,
  updateSavedView,
  deleteSavedView,
  setDefaultView
} from '@/api/productSavedViews';
import { ProductSavedView, CreateProductSavedViewParams, UpdateProductSavedViewParams } from '@/types/productSavedView';
import { Organization } from '@/types/organization';
import { ProductFilters } from '@/types/product';

export function useProductSavedViews(currentOrganization: Organization | null) {
  const queryClient = useQueryClient();

  // Fetch saved views
  const {
    data: savedViews = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['product-saved-views', currentOrganization?.id],
    queryFn: () => fetchSavedViews(currentOrganization),
    enabled: !!currentOrganization,
  });

  // Create saved view mutation
  const createMutation = useMutation({
    mutationFn: createSavedView,
    onSuccess: () => {
      toast.success('View saved successfully');
      queryClient.invalidateQueries({ queryKey: ['product-saved-views', currentOrganization?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to save view: ${error.message}`);
    }
  });

  // Update saved view mutation
  const updateMutation = useMutation({
    mutationFn: updateSavedView,
    onSuccess: () => {
      toast.success('View updated successfully');
      queryClient.invalidateQueries({ queryKey: ['product-saved-views', currentOrganization?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update view: ${error.message}`);
    }
  });

  // Delete saved view mutation
  const deleteMutation = useMutation({
    mutationFn: deleteSavedView,
    onSuccess: () => {
      toast.success('View deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['product-saved-views', currentOrganization?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete view: ${error.message}`);
    }
  });

  // Set default view mutation
  const setDefaultMutation = useMutation({
    mutationFn: ({id, organizationId}: {id: string, organizationId: string}) => 
      setDefaultView(id, organizationId),
    onSuccess: () => {
      toast.success('Default view set successfully');
      queryClient.invalidateQueries({ queryKey: ['product-saved-views', currentOrganization?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to set default view: ${error.message}`);
    }
  });

  // Find default view
  const defaultView = savedViews.find(view => view.is_default);

  const handleCreateView = (params: CreateProductSavedViewParams) => {
    createMutation.mutate(params);
  };

  const handleUpdateView = (params: UpdateProductSavedViewParams) => {
    updateMutation.mutate(params);
  };

  const handleDeleteView = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSetDefaultView = (id: string) => {
    if (currentOrganization) {
      setDefaultMutation.mutate({id, organizationId: currentOrganization.id});
    }
  };

  return {
    savedViews,
    defaultView,
    isLoading,
    error,
    createView: handleCreateView,
    updateView: handleUpdateView,
    deleteView: handleDeleteView,
    setDefaultView: handleSetDefaultView,
    refetch
  };
}
