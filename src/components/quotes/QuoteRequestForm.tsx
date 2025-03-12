
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Supplier } from "@/types/supplier";
import { useQuoteRequests } from "@/hooks/useQuoteRequests";
import { useOrganization } from "@/hooks/useOrganization";
import { useFormatsForSelect } from "@/hooks/useFormatsForSelect";
import { BasicFormFields } from "./form/BasicFormFields";
import { FormatFieldArray } from "./form/FormatFieldArray";
import { FormActions } from "./form/FormActions";
import { quoteRequestFormSchema, QuoteRequestFormValues } from "./form/schema";

interface QuoteRequestFormProps {
  suppliers: Supplier[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function QuoteRequestForm({ suppliers, onSuccess, onCancel }: QuoteRequestFormProps) {
  const { currentOrganization } = useOrganization();
  const { useCreateQuoteRequest } = useQuoteRequests();
  const createMutation = useCreateQuoteRequest();
  const { data: formats = [], isLoading: isFormatsLoading } = useFormatsForSelect(currentOrganization);
  
  const form = useForm<QuoteRequestFormValues>({
    resolver: zodResolver(quoteRequestFormSchema),
    defaultValues: {
      title: "",
      supplier_id: "",
      description: "",
      notes: "",
      formats: [],
    },
  });

  const onSubmit = async (values: QuoteRequestFormValues) => {
    if (!currentOrganization) return;

    createMutation.mutate(
      { 
        formData: values, 
        organizationId: currentOrganization.id 
      },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicFormFields control={form.control} suppliers={suppliers} />

        <FormatFieldArray 
          control={form.control} 
          formats={formats} 
          isFormatsLoading={isFormatsLoading} 
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormActions 
          isPending={createMutation.isPending} 
          onCancel={onCancel} 
        />
      </form>
    </Form>
  );
}
