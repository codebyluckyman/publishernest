
import { Control } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface TermsSectionProps {
  control: Control<SupplierQuoteFormValues>;
}

export function TermsSection({ control }: TermsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Terms and Conditions</h3>
      
      <div>
        <FormField
          control={control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terms</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter any terms and conditions for this quote..." 
                  className="min-h-[150px]"
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div>
        <FormField
          control={control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter any additional remarks..." 
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
    </div>
  );
}
