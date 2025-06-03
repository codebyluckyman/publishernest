
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ProductCustomField } from '@/types/customFields';
import { format } from 'date-fns';

interface CustomFieldBadgeProps {
  field: ProductCustomField;
  value: any;
}

// Map common color names to Badge variants
const getColorVariant = (color: string): any => {
  const colorMap: Record<string, string> = {
    red: 'destructive',
    green: 'success',
    blue: 'blue',
    yellow: 'warning',
    amber: 'warning',
    cyan: 'info',
    orange: 'warning',
    emerald: 'success',
    gray: 'secondary',
    grey: 'secondary'
  };

  return colorMap[color.toLowerCase()] || 'outline';
};

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
          const variant = getColorVariant(color);
          return (
            <Badge variant={variant}>
              {value}
            </Badge>
          );
        }
        return (
          <Badge variant="outline">
            {value}
          </Badge>
        );
      
      default:
        return value;
    }
  };

  return <span className="text-sm">{renderValue()}</span>;
}
