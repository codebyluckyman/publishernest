
import { useEffect } from 'react';
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
import { format, parse } from 'date-fns';

interface CustomFieldsSectionProps {
  form: UseFormReturn<ProductFormValues>;
  productId?: string;
  readOnly?: boolean;
}

export function CustomFieldsSection({ form, productId, readOnly = false }: CustomFieldsSectionProps) {
  const { customFields, isLoading } = useOrganizationProductFields();
  
  useEffect(() => {
    // Register custom fields in the form
    if (customFields.length > 0) {
      customFields.forEach(field => {
        const fieldPath = `custom_fields.${field.field_key}` as any;
        if (!form.getValues(fieldPath)) {
          form.setValue(fieldPath, null);
        }
      });
    }
  }, [customFields, form]);

  if (isLoading) {
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

  const renderFieldInput = (field: any) => {
    const fieldPath = `custom_fields.${field.field_key}`;

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
                checked={form.getValues(fieldPath as any)}
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
              value={form.getValues(fieldPath as any) || ""}
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
