
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/context/OrganizationContext';
import { ProductCustomField } from '@/types/customFields';
import { toast } from 'sonner';

export function useOrganizationProductFields() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  
  // Fetch all custom fields for the current organization
  const { 
    data: customFields,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['organization-product-fields', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('organization_product_fields')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('display_order', { ascending: true });
        
      if (error) {
        throw new Error(`Error fetching custom fields: ${error.message}`);
      }
      
      return data as ProductCustomField[];
    },
    enabled: !!currentOrganization?.id,
  });

  // Create a new custom field
  const createCustomField = useMutation({
    mutationFn: async (field: Omit<ProductCustomField, 'id' | 'created_at' | 'updated_at'>) => {
      if (!currentOrganization?.id) {
        throw new Error('No organization selected');
      }

      const { data, error } = await supabase
        .from('organization_product_fields')
        .insert({
          ...field,
          organization_id: currentOrganization.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-product-fields', currentOrganization?.id] });
      toast.success('Custom field created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create custom field: ${error.message}`);
    }
  });

  // Update an existing custom field
  const updateCustomField = useMutation({
    mutationFn: async (field: Partial<ProductCustomField> & { id: string }) => {
      const { data, error } = await supabase
        .from('organization_product_fields')
        .update(field)
        .eq('id', field.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-product-fields', currentOrganization?.id] });
      toast.success('Custom field updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update custom field: ${error.message}`);
    }
  });

  // Delete a custom field
  const deleteCustomField = useMutation({
    mutationFn: async (fieldId: string) => {
      const { error } = await supabase
        .from('organization_product_fields')
        .delete()
        .eq('id', fieldId);

      if (error) {
        throw error;
      }

      return fieldId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-product-fields', currentOrganization?.id] });
      toast.success('Custom field deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete custom field: ${error.message}`);
    }
  });

  // Reorder custom fields
  const reorderCustomFields = useMutation({
    mutationFn: async (fields: { id: string, display_order: number }[]) => {
      const updates = fields.map(field => ({
        id: field.id,
        display_order: field.display_order
      }));
      
      const { error } = await supabase
        .from('organization_product_fields')
        .upsert(updates);

      if (error) {
        throw error;
      }

      return fields;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-product-fields', currentOrganization?.id] });
    },
    onError: (error: any) => {
      toast.error(`Failed to reorder custom fields: ${error.message}`);
    }
  });

  return {
    customFields: customFields || [],
    isLoading,
    error,
    refetch,
    createCustomField,
    updateCustomField,
    deleteCustomField,
    reorderCustomFields
  };
}
