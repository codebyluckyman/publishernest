
import { Badge } from "@/components/ui/badge";
import { ProductCustomField } from "@/types/customFields";

interface CustomFieldBadgeProps {
  value: string | null;
  field: ProductCustomField;
}

export function CustomFieldBadge({ value, field }: CustomFieldBadgeProps) {
  if (!value || field.field_type !== 'select') {
    return <span>{value || 'N/A'}</span>;
  }

  // Get the color for this value from field options
  const color = field.options?.colors?.[value];
  
  // Map predefined colors to badge variants
  const getVariant = (color?: string) => {
    switch (color) {
      case 'red': return 'destructive';
      case 'green': return 'success';
      case 'blue': return 'blue';
      case 'yellow': return 'warning';
      case 'cyan': return 'info';
      case 'purple': return 'secondary';
      default: return 'default';
    }
  };

  const variant = getVariant(color);
  
  return (
    <Badge variant={variant}>
      {value}
    </Badge>
  );
}
