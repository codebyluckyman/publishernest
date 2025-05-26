
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useOrganizationProductFields } from "@/hooks/useOrganizationProductFields";
import { CustomFieldBadge } from "../CustomFieldBadge";

interface CustomFieldsSectionProps {
  form: any;
  productId?: string;
}

export function CustomFieldsSection({ form, productId }: CustomFieldsSectionProps) {
  const { customFields } = useOrganizationProductFields();

  if (!customFields || customFields.length === 0) {
    return null;
  }

  const renderCustomField = (field: any) => {
    const fieldPath = `custom_fields.${field.field_key}` as const;
    
    switch (field.field_type) {
      case 'text':
        return (
          <FormField
            control={form.control}
            name={fieldPath}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.field_name} {field.is_required && '*'}</FormLabel>
                <FormControl>
                  <Input {...formField} value={formField.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'number':
        return (
          <FormField
            control={form.control}
            name={fieldPath}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.field_name} {field.is_required && '*'}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...formField} 
                    value={formField.value || ''} 
                    onChange={(e) => formField.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'boolean':
        return (
          <FormField
            control={form.control}
            name={fieldPath}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>{field.field_name} {field.is_required && '*'}</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={formField.value || false}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        );

      case 'date':
        return (
          <FormField
            control={form.control}
            name={fieldPath}
            render={({ field: formField }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{field.field_name} {field.is_required && '*'}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !formField.value && "text-muted-foreground"
                        )}
                      >
                        {formField.value ? (
                          format(formField.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formField.value}
                      onSelect={formField.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'select':
        return (
          <FormField
            control={form.control}
            name={fieldPath}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.field_name} {field.is_required && '*'}</FormLabel>
                <div className="space-y-2">
                  <Select 
                    onValueChange={(value) => formField.onChange(value === "none" ? null : value)} 
                    value={formField.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {field.options?.values?.map((option: string) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Show badge preview when a value is selected */}
                  {formField.value && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Preview:</span>
                      <CustomFieldBadge value={formField.value} field={field} />
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
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
      <CardContent className="space-y-4">
        {customFields.map((field) => (
          <div key={field.id}>
            {renderCustomField(field)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
