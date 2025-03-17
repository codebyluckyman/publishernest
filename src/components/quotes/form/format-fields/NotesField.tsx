
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { QuoteRequestFormValues } from "../schema";

interface NotesFieldProps {
  control: Control<QuoteRequestFormValues>;
  index: number;
}

export function NotesField({ control, index }: NotesFieldProps) {
  return (
    <FormField
      control={control}
      name={`formats.${index}.notes`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Format Notes</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Add any additional notes about this format"
              className="h-20"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
