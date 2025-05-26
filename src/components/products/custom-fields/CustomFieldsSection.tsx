
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganizationProductFields } from '@/hooks/useOrganizationProductFields';
import { useProductCustomFieldValues } from '@/hooks/useProductCustomFieldValues';
import { CustomFieldInput } from './CustomFieldInput';
import { Loader2 } from 'lucide-react';

interface CustomFieldsSectionProps {
  productId?: string;
  readOnly?: boolean;
}

export function CustomFieldsSection({ productId, readOnly = false }: CustomFieldsSectionProps) {
  const { customFields, isLoading: fieldsLoading } = useOrganizationProductFields();
  const { 
    fieldValues, 
    isLoading: valuesLoading, 
    updateFieldValue, 
    getFieldValue 
  } = useProductCustomFieldValues(productId);

  if (fieldsLoading || valuesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!customFields || customFields.length === 0) {
    return null;
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    if (!readOnly && productId) {
      updateFieldValue.mutate({ fieldId, value });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Fields</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {customFields.map((field) => {
          const currentValue = getFieldValue(field.id);
          
          return (
            <CustomFieldInput
              key={field.id}
              field={field}
              value={currentValue}
              onChange={(value) => handleFieldChange(field.id, value)}
              readOnly={readOnly}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
