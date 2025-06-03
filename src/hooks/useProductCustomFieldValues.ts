
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/context/OrganizationContext';
import { ProductCustomFieldValue } from '@/types/customFields';
import { toast } from 'sonner';

export function useProductCustomFieldValues(productId: string | undefined) {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  // Fetch custom field values for a specific product
  const { 
    data: fieldValues = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['product-custom-field-values', productId, currentOrganization?.id],
    queryFn: async () => {
      if (!productId || !currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('product_custom_field_values')
        .select(`
          *,
          field:organization_product_fields(*)
        `)
        .eq('product_id', productId);
        
      if (error) {
        throw new Error(`Error fetching custom field values: ${error.message}`);
      }
      
      return data as ProductCustomFieldValue[];
    },
    enabled: !!productId && !!currentOrganization?.id,
  });

  // Update or create a custom field value
  const updateFieldValue = useMutation({
    mutationFn: async ({ fieldId, value }: { fieldId: string, value: any }) => {
      if (!productId || !currentOrganization?.id) {
        throw new Error('Product ID and organization are required');
      }

      // First try to update existing value
      const { data: existing } = await supabase
        .from('product_custom_field_values')
        .select('id')
        .eq('product_id', productId)
        .eq('field_id', fieldId)
        .maybeSingle();

      if (existing) {
        // Update existing value
        const { data, error } = await supabase
          .from('product_custom_field_values')
          .update({ field_value: value })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new value
        const { data, error } = await supabase
          .from('product_custom_field_values')
          .insert({
            product_id: productId,
            field_id: fieldId,
            field_value: value
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['product-custom-field-values', productId, currentOrganization?.id] 
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to update custom field: ${error.message}`);
    }
  });

  // Get value for a specific field
  const getFieldValue = (fieldId: string) => {
    const fieldValue = fieldValues.find(fv => fv.field_id === fieldId);
    return fieldValue?.field_value || null;
  };

  return {
    fieldValues,
    isLoading,
    error,
    updateFieldValue,
    getFieldValue
  };
}
