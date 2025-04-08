
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "../CustomerForm";

interface RequirementsSectionProps {
  form: UseFormReturn<CustomerFormValues>;
}

export function RequirementsSection({ form }: RequirementsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Requirements</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FormField
            control={form.control}
            name="file_approval_required"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <FormLabel>File Approval Required</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <FormField
            control={form.control}
            name="advance_payment_required"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <FormLabel>Advance Payment Required</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
      
      <FormField
        control={form.control}
        name="packaging_requirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Packaging Requirements</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="carton_marking_requirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Carton Marking Requirements</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="freight_forwarder"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Freight Forwarder</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="document_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Document Notes</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
