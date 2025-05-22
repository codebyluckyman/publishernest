
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductCustomField, ProductCustomFieldValue } from '@/types/customFields';
import { toast } from 'sonner';

export function useProductCustomFieldValues(productId?: string) {
  const queryClient = useQueryClient();
  
  // Fetch all custom field values for a specific product
  const {
    data: customFieldValues,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['product-custom-field-values', productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const { data, error } = await supabase
        .from('product_custom_field_values')
        .select(`
          *,
          field:field_id (*)
        `)
        .eq('product_id', productId);
        
      if (error) {
        throw new Error(`Error fetching custom field values: ${error.message}`);
      }
      
      return data as ProductCustomFieldValue[];
    },
    enabled: !!productId,
  });

  // Save custom field values (create or update)
  const saveCustomFieldValues = useMutation({
    mutationFn: async (values: Array<{ 
      product_id: string; 
      field_id: string; 
      field_value: any;
      id?: string;
    }>) => {
      if (!values.length) return [];

      const upserts = values.map(value => ({
        id: value.id, // Will be undefined for new values
        product_id: value.product_id,
        field_id: value.field_id,
        field_value: value.field_value
      }));

      const { data, error } = await supabase
        .from('product_custom_field_values')
        .upsert(upserts, { onConflict: 'product_id,field_id', ignoreDuplicates: false })
        .select();

      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-custom-field-values', variables[0]?.product_id] });
      toast.success('Custom field values saved successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to save custom field values: ${error.message}`);
    }
  });

  // Helper function to prepare field values for a product
  const prepareCustomFieldValues = (fields: ProductCustomField[], existingValues: ProductCustomFieldValue[] = []) => {
    return fields.map(field => {
      // Look for an existing value
      const existingValue = existingValues.find(v => v.field_id === field.id);
      
      // If no existing value, create a new one with default value based on field type
      if (!existingValue) {
        return {
          product_id: productId!,
          field_id: field.id,
          field_value: getDefaultValueForType(field.field_type),
          field
        };
      }
      
      return existingValue;
    });
  };

  // Helper to get default value based on field type
  const getDefaultValueForType = (fieldType: string) => {
    switch (fieldType) {
      case 'text':
        return '';
      case 'number':
        return null;
      case 'date':
        return null;
      case 'boolean':
        return false;
      case 'select':
        return null;
      default:
        return null;
    }
  };

  return {
    customFieldValues: customFieldValues || [],
    isLoading,
    error,
    refetch,
    saveCustomFieldValues,
    prepareCustomFieldValues
  };
}
