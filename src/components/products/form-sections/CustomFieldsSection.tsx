import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useOrganizationProductFields } from '@/hooks/useOrganizationProductFields';
import { ProductFormValues } from '@/schemas/productSchema';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductCustomFieldValues } from '@/hooks/useProductCustomFieldValues';
import { ProductCustomField } from '@/types/customFields';

interface CustomFieldsSectionProps {
  form: UseFormReturn<ProductFormValues>;
  productId?: string;
  readOnly?: boolean;
}

export function CustomFieldsSection({ form, productId, readOnly = false }: CustomFieldsSectionProps) {
  const { customFields, isLoading: isFieldsLoading } = useOrganizationProductFields();
  const { 
    customFieldValues, 
    isLoading: isValuesLoading 
  } = useProductCustomFieldValues(productId);
  
  const [initialized, setInitialized] = useState(false);

  // Debug logging
  useEffect(() => {
    if (customFieldValues.length > 0) {
      console.log('Custom field values from DB:', customFieldValues);
    }
  }, [customFieldValues]);

  // Initialize form values from database when custom fields and values are loaded
  useEffect(() => {
    if (customFields.length > 0 && !initialized) {
      // Create a map of custom field values by field_key for easier lookup
      const valuesMap: Record<string, any> = {};
      
      // For each custom field value, find the corresponding field and map it
      customFieldValues.forEach(valueObj => {
        const field = customFields.find(f => f.id === valueObj.field_id);
        if (field) {
          // Convert the value to the appropriate type based on field_type
          let typedValue = valueObj.field_value;
          
          switch (field.field_type) {
            case 'number':
              typedValue = typeof typedValue === 'number' ? typedValue : 
                           typedValue === null ? null : 
                           Number(typedValue) || null;
              break;
            case 'boolean':
              typedValue = Boolean(typedValue);
              break;
            case 'date':
              if (typedValue && typeof typedValue === 'string') {
                try {
                  typedValue = new Date(typedValue);
                } catch (e) {
                  typedValue = null;
                }
              }
              break;
            // For text and select, keep as is
          }
          
          console.log(`Setting ${field.field_key} to:`, typedValue);
          valuesMap[field.field_key] = typedValue;
        }
      });
      
      // Update the form's custom_fields object
      if (Object.keys(valuesMap).length > 0) {
        form.setValue('custom_fields', {
          ...form.getValues('custom_fields'),
          ...valuesMap
        });
        console.log('Set form values:', valuesMap);
      }
      
      setInitialized(true);
    }
  }, [customFields, customFieldValues, form, initialized]);

  // Also register any fields that don't have values yet
  useEffect(() => {
    if (customFields.length > 0) {
      customFields.forEach(field => {
        const fieldPath = `custom_fields.${field.field_key}` as const;
        if (form.getValues(fieldPath) === undefined) {
          const defaultValue = getDefaultValueForType(field.field_type);
          form.setValue(fieldPath, defaultValue);
        }
      });
    }
  }, [customFields, form]);

  if (isFieldsLoading || isValuesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (customFields.length === 0) {
    return null; // Don't show the section if there are no custom fields
  }

  // Helper to get default value based on field type
  function getDefaultValueForType(fieldType: string) {
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
  }

  const renderFieldInput = (field: ProductCustomField) => {
    const fieldPath = `custom_fields.${field.field_key}`;
    const fieldValue = form.watch(fieldPath as any);
    
    console.log(`Field ${field.field_key} value:`, fieldValue);

    switch (field.field_type) {
      case 'text':
        return (
          <FormItem>
            <FormLabel>{field.field_name}{field.is_required ? ' *' : ''}</FormLabel>
            <FormControl>
              <Input
                {...form.register(fieldPath as any)}
                disabled={readOnly}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
        
      case 'number':
        return (
          <FormItem>
            <FormLabel>{field.field_name}{field.is_required ? ' *' : ''}</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...form.register(fieldPath as any, {
                  valueAsNumber: true,
                  setValueAs: v => v === '' ? null : parseFloat(v)
                })}
                disabled={readOnly}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
        
      case 'date':
        return (
          <FormItem>
            <FormLabel>{field.field_name}{field.is_required ? ' *' : ''}</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...form.register(fieldPath as any)}
                disabled={readOnly}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
        
      case 'boolean':
        return (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox 
                checked={fieldValue}
                onCheckedChange={(checked) => {
                  form.setValue(fieldPath as any, checked);
                }}
                disabled={readOnly}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>{field.field_name}{field.is_required ? ' *' : ''}</FormLabel>
            </div>
          </FormItem>
        );
        
      case 'select':
        return (
          <FormItem>
            <FormLabel>{field.field_name}{field.is_required ? ' *' : ''}</FormLabel>
            <Select
              value={fieldValue || "none"}
              onValueChange={(value) => {
                // Convert "none" to null for the actual form value
                form.setValue(fieldPath as any, value === "none" ? null : value);
              }}
              disabled={readOnly}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${field.field_name.toLowerCase()}`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {field.options?.values?.map((option: string) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Fields</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customFields.map((field) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`custom_fields.${field.field_key}` as any}
              render={() => renderFieldInput(field)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
