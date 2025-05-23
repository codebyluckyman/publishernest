
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
      
      console.log(`Fetching custom field values for product: ${productId}`);
      
      const { data, error } = await supabase
        .from('product_custom_field_values')
        .select(`
          *,
          field:field_id (*)
        `)
        .eq('product_id', productId);
        
      if (error) {
        console.error(`Error fetching custom field values: ${error.message}`);
        throw new Error(`Error fetching custom field values: ${error.message}`);
      }
      
      console.log(`Retrieved ${data?.length} custom field values:`, data);
      
      // Process the values to ensure they're in the correct format
      const processedValues = data.map(value => {
        const fieldType = value.field?.field_type;
        let processedValue = value.field_value;
        
        // Ensure the field_value is in the correct type based on field_type
        if (fieldType) {
          switch (fieldType) {
            case 'number':
              processedValue = processedValue === null ? null : 
                               typeof processedValue === 'number' ? processedValue :
                               Number(processedValue) || null;
              break;
            case 'boolean':
              processedValue = typeof processedValue === 'boolean' ? processedValue :
                               processedValue === 'true' ? true :
                               processedValue === 'false' ? false :
                               !!processedValue;
              break;
            case 'date':
              if (processedValue && typeof processedValue === 'string') {
                try {
                  const date = new Date(processedValue);
                  if (!isNaN(date.getTime())) {
                    processedValue = date;
                  } else {
                    processedValue = null;
                  }
                } catch (e) {
                  processedValue = null;
                }
              }
              break;
            // For select and text, ensure we have a string (or null)
            case 'select':
            case 'text':
              processedValue = processedValue === null ? null :
                               typeof processedValue === 'string' ? processedValue :
                               String(processedValue);
              break;
          }
        }
        
        return {
          ...value,
          field_value: processedValue
        };
      });
      
      return processedValues as ProductCustomFieldValue[];
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

      console.log('Saving custom field values:', values);

      // Map each value, only including id if it actually exists
      const upserts = values.map(value => {
        // Create a base object with the required fields
        const upsertRecord: Record<string, any> = {
          product_id: value.product_id,
          field_id: value.field_id,
          field_value: value.field_value
        };
        
        // Only add id to the record if it exists
        if (value.id) {
          upsertRecord.id = value.id;
        }

        return upsertRecord;
      });

      const { data, error } = await supabase
        .from('product_custom_field_values')
        .upsert(upserts, { onConflict: 'product_id,field_id', ignoreDuplicates: false })
        .select();

      if (error) {
        console.error('Error saving custom field values:', error);
        throw error;
      }
      
      console.log('Successfully saved custom field values, response:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-custom-field-values', variables[0]?.product_id] });
      toast.success('Custom field values saved successfully');
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
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

  // Helper function to format value for display
  const formatValueForDisplay = (value: any, fieldType: string) => {
    if (value === null || value === undefined) return '';
    
    switch (fieldType) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }
        if (typeof value === 'string') {
          try {
            const date = new Date(value);
            return date.toISOString().split('T')[0];
          } catch (e) {
            return value;
          }
        }
        return String(value);
      default:
        return String(value);
    }
  };

  return {
    customFieldValues: customFieldValues || [],
    isLoading,
    error,
    refetch,
    saveCustomFieldValues,
    prepareCustomFieldValues,
    formatValueForDisplay,
    getDefaultValueForType
  };
}
