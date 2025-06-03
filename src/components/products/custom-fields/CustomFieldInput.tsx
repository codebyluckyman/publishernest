
import React from 'react';
import { ProductCustomField } from '@/types/customFields';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CustomFieldBadge } from './CustomFieldBadge';

interface CustomFieldInputProps {
  field: ProductCustomField;
  value: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
}

export function CustomFieldInput({ field, value, onChange, readOnly = false }: CustomFieldInputProps) {
  const handleDateChange = (date: Date | undefined) => {
    onChange(date ? date.toISOString().split('T')[0] : null);
  };

  const renderInput = () => {
    switch (field.field_type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            placeholder={`Enter ${field.field_name.toLowerCase()}`}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
            disabled={readOnly}
            placeholder={`Enter ${field.field_name.toLowerCase()}`}
          />
        );

      case 'date':
        const dateValue = value ? new Date(value) : undefined;
        
        if (readOnly) {
          return (
            <Input
              value={value ? format(new Date(value), 'PPP') : ''}
              disabled
            />
          );
        }

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateValue && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateValue ? format(dateValue, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value === true}
              onCheckedChange={(checked) => onChange(checked)}
              disabled={readOnly}
            />
            <span className="text-sm">Yes</span>
          </div>
        );

      case 'select':
        const options = field.options?.values || [];
        
        // In read-only mode, don't render a select input
        if (readOnly) {
          return null;
        }
        
        return (
          <Select
            value={value || "none"}
            onValueChange={(val) => onChange(val === "none" ? null : val)}
            disabled={readOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.field_name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {options.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {field.field_name}
        {field.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {/* For read-only select fields, display the badge below the label and input area */}
      {readOnly && field.field_type === 'select' && (
        <div className="pt-1">
          {value ? (
            <CustomFieldBadge field={field} value={value} />
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </div>
      )}
    </div>
  );
}
