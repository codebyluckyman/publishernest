
import { Control } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";

interface QuoteDetailsSectionProps {
  control: Control<SupplierQuoteFormValues>;
}

export function QuoteDetailsSection({ control }: QuoteDetailsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Quote Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reference Field */}
        <FormField
          control={control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Reference</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. Q-12345" 
                  {...field} 
                  value={field.value || ''} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Validity Dates */}
        <FormField
          control={control}
          name="valid_from"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Valid From</FormLabel>
              <DatePicker
                date={field.value ? new Date(field.value) : undefined}
                setDate={(date) => field.onChange(date ? date.toISOString().split('T')[0] : undefined)}
                placeholder="Select start date"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="valid_to"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Valid Until</FormLabel>
              <DatePicker
                date={field.value ? new Date(field.value) : undefined}
                setDate={(date) => field.onChange(date ? date.toISOString().split('T')[0] : undefined)}
                placeholder="Select end date"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Terms */}
      <FormField
        control={control}
        name="terms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Terms & Conditions</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter payment terms, delivery terms, etc." 
                className="min-h-[100px]" 
                {...field} 
                value={field.value || ''} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Remarks */}
      <FormField
        control={control}
        name="remarks"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Remarks</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Any additional information for this quote" 
                className="min-h-[100px]" 
                {...field} 
                value={field.value || ''} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
