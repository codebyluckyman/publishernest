
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/context/OrganizationContext';
import { ProductCustomField } from '@/types/customFields';
import { toast } from 'sonner';

export function useOrganizationProductFields() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  const { data: customFields, isLoading } = useQuery({
    queryKey: ['organization-product-fields', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('organization_product_fields')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('display_order');
      
      if (error) throw error;
      return data as ProductCustomField[];
    },
    enabled: !!currentOrganization?.id,
  });

  const createField = useMutation({
    mutationFn: async (field: Omit<ProductCustomField, 'id' | 'created_at' | 'updated_at'>) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');
      
      const { data, error } = await supabase
        .from('organization_product_fields')
        .insert({
          ...field,
          organization_id: currentOrganization.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-product-fields'] });
      toast.success('Custom field created successfully');
    },
    onError: (error) => {
      console.error('Error creating custom field:', error);
      toast.error('Failed to create custom field');
    },
  });

  const updateField = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ProductCustomField> }) => {
      const { data, error } = await supabase
        .from('organization_product_fields')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-product-fields'] });
      toast.success('Custom field updated successfully');
    },
    onError: (error) => {
      console.error('Error updating custom field:', error);
      toast.error('Failed to update custom field');
    },
  });

  const deleteField = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('organization_product_fields')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-product-fields'] });
      toast.success('Custom field deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting custom field:', error);
      toast.error('Failed to delete custom field');
    },
  });

  const reorderFields = useMutation({
    mutationFn: async (fields: { id: string; display_order: number }[]) => {
      // Update each field individually
      const updates = fields.map(field => 
        supabase
          .from('organization_product_fields')
          .update({ display_order: field.display_order })
          .eq('id', field.id)
      );
      
      const results = await Promise.all(updates);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error('Failed to reorder some fields');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-product-fields'] });
      toast.success('Field order updated successfully');
    },
    onError: (error) => {
      console.error('Error reordering fields:', error);
      toast.error('Failed to reorder fields');
    },
  });

  return {
    customFields: customFields || [],
    isLoading,
    createField,
    updateField,
    deleteField,
    reorderFields,
  };
}
