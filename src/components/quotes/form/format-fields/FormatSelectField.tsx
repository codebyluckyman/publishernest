
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuoteRequestFormValues } from "../schema";
import { FormatForSelect } from "@/hooks/useFormatsForSelect";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormatSelectFieldProps {
  control: Control<QuoteRequestFormValues>;
  index: number;
  formats: FormatForSelect[];
  isLoading: boolean;
}

export function FormatSelectField({
  control,
  index,
  formats,
  isLoading,
}: FormatSelectFieldProps) {
  // Transform formats data for the select component
  const formatOptions = formats.map(format => ({
    label: format.format_name,
    value: format.id
  }));

  return (
    <FormField
      control={control}
      name={`formats.${index}.format_id`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Format</FormLabel>
          <FormControl>
            {isLoading ? (
              <div className="flex items-center h-10 px-3 py-2 border rounded-md">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span className="text-sm">Loading formats...</span>
              </div>
            ) : (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoading}
              >
                <SelectTrigger className={cn("w-full", !field.value && "text-muted-foreground")}>
                  <SelectValue placeholder="Select a format" />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
