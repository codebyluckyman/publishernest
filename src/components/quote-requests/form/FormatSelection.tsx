
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Format } from "@/types/quoteRequest";
import { useFormatsApi } from "@/hooks/useFormatsApi";
import { Organization } from "@/types/organization";
import { useFormContext } from "react-hook-form";

interface FormatSelectionProps {
  organizationId: string | undefined;
  initialFormatIds: string[];
}

export function FormatSelection({ organizationId, initialFormatIds }: FormatSelectionProps) {
  const { formats, isLoadingFormats } = useFormatsApi({ id: organizationId } as Organization | null);
  const [selectedFormatIds, setSelectedFormatIds] = useState<string[]>(initialFormatIds);
  const form = useFormContext();

  useEffect(() => {
    setSelectedFormatIds(initialFormatIds);
  }, [initialFormatIds]);

  const handleFormatToggle = (formatId: string, checked: boolean) => {
    const updatedFormatIds = checked
      ? [...selectedFormatIds, formatId]
      : selectedFormatIds.filter(id => id !== formatId);
    
    setSelectedFormatIds(updatedFormatIds);
    form.setValue('format_ids', updatedFormatIds);
  };

  return (
    <FormField
      control={form.control}
      name="format_ids"
      render={() => (
        <FormItem>
          <FormLabel>Formats</FormLabel>
          <div className="border rounded-md p-4 space-y-2">
            {isLoadingFormats ? (
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : formats.length === 0 ? (
              <p className="text-muted-foreground py-2 text-center">No formats available</p>
            ) : (
              formats.map((format: Format) => (
                <div key={format.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`format-${format.id}`} 
                    checked={selectedFormatIds.includes(format.id)}
                    onCheckedChange={(checked) => handleFormatToggle(format.id, checked === true)}
                  />
                  <label 
                    htmlFor={`format-${format.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {format.format_name}
                  </label>
                </div>
              ))
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
