
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ProductCustomField } from '@/types/customFields';
import { format } from 'date-fns';

interface CustomFieldBadgeProps {
  field: ProductCustomField;
  value: any;
}

export function CustomFieldBadge({ field, value }: CustomFieldBadgeProps) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }

  const renderValue = () => {
    switch (field.field_type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      
      case 'date':
        try {
          return format(new Date(value), 'MMM dd, yyyy');
        } catch {
          return value;
        }
      
      case 'select':
        const colors = field.options?.colors;
        const color = colors?.[value];
        
        if (color) {
          return (
            <Badge variant={color as any}>
              {value}
            </Badge>
          );
        }
        return value;
      
      default:
        return value;
    }
  };

  return <span className="text-sm">{renderValue()}</span>;
}
