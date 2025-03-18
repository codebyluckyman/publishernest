
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { QuoteRequestFormValues } from "./schema";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PriceBreakFieldProps {
  control: Control<QuoteRequestFormValues>;
  formatIndex: number;
  onRemove: () => void;
}

export function PriceBreakField({ control, formatIndex, onRemove }: PriceBreakFieldProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 flex items-center justify-between">
        <FormField
          control={control}
          name={`formats.${formatIndex}.price_breaks.0.quantity`}
          render={({ field }) => (
            <FormItem className="flex-1 mr-2">
              <FormLabel className="text-xs">Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  className="h-8"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 self-end mb-0.5"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardContent>
    </Card>
  );
}
