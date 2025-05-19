
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchPresentationSections, 
  fetchPresentationItems,
  createPresentationSection,
  updatePresentationSection,
  deletePresentationSection,
  addPresentationItem,
  updatePresentationItem,
  deletePresentationItem 
} from '@/api/salesPresentations/presentationSections';
import { toast } from 'sonner';
import { PresentationSection } from '@/types/salesPresentation';

export function usePresentationSections(presentationId?: string) {
  const queryClient = useQueryClient();
  
  const sections = useQuery({
    queryKey: ['presentation-sections', presentationId],
    queryFn: () => fetchPresentationSections(presentationId!),
    enabled: !!presentationId
  });
  
  const getSectionItems = (sectionId: string) => {
    return useQuery({
      queryKey: ['presentation-items', sectionId],
      queryFn: () => fetchPresentationItems(sectionId),
      enabled: !!sectionId
    });
  };
  
  const createSection = useMutation({
    mutationFn: async (sectionData: {
      title: string;
      description?: string;
      section_type: string;
      content?: any;
      presentation_id: string;
    }) => {
      if (!presentationId) throw new Error('No presentation ID provided');
      return createPresentationSection(presentationId, {
        ...sectionData,
        section_order: 0, // This will be sorted on the backend
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentation-sections', presentationId] });
      toast.success('Section created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create section');
      console.error('Create section error:', error);
    }
  });
  
  const updateSection = useMutation({
    mutationFn: async ({ 
      sectionId, 
      sectionData 
    }: { 
      sectionId: string;
      sectionData: {
        title?: string;
        description?: string;
        content?: any;
        section_order?: number;
      }
    }) => {
      return updatePresentationSection(sectionId, sectionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentation-sections', presentationId] });
      toast.success('Section updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update section');
      console.error('Update section error:', error);
    }
  });
  
  const deleteSection = useMutation({
    mutationFn: async (sectionId: string) => {
      return deletePresentationSection(sectionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentation-sections', presentationId] });
      toast.success('Section deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete section');
      console.error('Delete section error:', error);
    }
  });
  
  const addItem = useMutation({
    mutationFn: async ({
      sectionId,
      itemData
    }: {
      sectionId: string;
      itemData: {
        item_type: string;
        item_id?: string;
        title?: string;
        description?: string;
        custom_price?: number;
        currency?: string;
        custom_content?: any;
        display_order: number;
      }
    }) => {
      return addPresentationItem(sectionId, itemData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['presentation-items', variables.sectionId] });
      toast.success('Item added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add item');
      console.error('Add item error:', error);
    }
  });
  
  const updateItem = useMutation({
    mutationFn: async ({
      itemId,
      sectionId,
      itemData
    }: {
      itemId: string;
      sectionId: string;
      itemData: {
        title?: string;
        description?: string;
        custom_price?: number;
        currency?: string;
        custom_content?: any;
        display_order?: number;
      }
    }) => {
      return updatePresentationItem(itemId, itemData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['presentation-items', variables.sectionId] });
      toast.success('Item updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update item');
      console.error('Update item error:', error);
    }
  });
  
  const deleteItem = useMutation({
    mutationFn: async ({
      itemId,
      sectionId
    }: {
      itemId: string;
      sectionId: string;
    }) => {
      return deletePresentationItem(itemId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['presentation-items', variables.sectionId] });
      toast.success('Item deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete item');
      console.error('Delete item error:', error);
    }
  });
  
  return {
    sections,
    getSectionItems,
    createSection,
    updateSection,
    deleteSection,
    addItem,
    updateItem,
    deleteItem
  };
}
