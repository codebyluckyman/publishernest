
import { FormField, FormItem, FormControl, FormLabel, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { QuoteRequestFormValues } from "./schema";

export function ProductionScheduleField() {
  const form = useFormContext<QuoteRequestFormValues>();
  
  return (
    <div className="bg-muted/30 p-4 rounded-md border border-border">
      <div className="flex items-start space-x-3">
        <Calendar className="h-5 w-5 text-primary mt-0.5" />
        <div className="space-y-1.5">
          <FormField
            control={form.control}
            name="production_schedule_requested"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-semibold">Request Production Schedule</FormLabel>
                  <FormDescription>
                    Ask the supplier to include a detailed production timeline with their quote.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
