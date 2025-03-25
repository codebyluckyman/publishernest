
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteRequestFormSchema, QuoteRequestFormValues } from "./form/schema";
import { BasicFormFields } from "./form/BasicFormFields";
import { FormatFieldArray } from "./form/FormatFieldArray";
import { FormActions } from "./form/FormActions";
import { ExtraCostsField } from "./form/extra-costs/ExtraCostsField";
import { SavingsField } from "./form/savings/SavingsField";
import { Supplier } from "@/types/supplier";
import { Form } from "@/components/ui/form";
import { useEffect } from "react";

interface QuoteRequestFormProps {
  onSubmit: (data: QuoteRequestFormValues) => void;
  suppliers: Supplier[];
  initialValues?: Partial<QuoteRequestFormValues>;
  isSubmitting: boolean;
  onCancel: () => void;
  hasFormats?: boolean;
}

export function QuoteRequestForm({
  onSubmit,
  suppliers,
  initialValues,
  isSubmitting,
  onCancel,
  hasFormats = false,
}: QuoteRequestFormProps) {
  const form = useForm<QuoteRequestFormValues>({
    resolver: zodResolver(quoteRequestFormSchema),
    defaultValues: {
      id: initialValues?.id,
      title: initialValues?.title || "",
      supplier_ids: initialValues?.supplier_ids || [],
      description: initialValues?.description || "",
      due_date: initialValues?.due_date,
      notes: initialValues?.notes || "",
      formats: initialValues?.formats?.map(format => ({
        ...format,
        products: format.products || []
      })) || [],
      extra_costs: initialValues?.extra_costs || [],
      savings: initialValues?.savings || [],
      currency: initialValues?.currency || "USD",
      products: initialValues?.products || {},
      quantities: initialValues?.quantities || {},
      supplier_id: initialValues?.supplier_id,
    },
  });

  useEffect(() => {
    console.log("Initial form values:", form.getValues());
  }, [form]);

  const handleFormSubmit = (data: QuoteRequestFormValues) => {
    if (!data.title) {
      data.title = `Quote Request - ${new Date().toLocaleDateString()}`;
    }
    
    console.log("Form submission data:", data);
    onSubmit(data);
  };

  // When formats change, check if we need to update the form state
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // If formats array changes, update the title automatically
      if (name?.startsWith('formats') && form.getValues('formats')?.length > 0) {
        // Note: The actual title calculation will happen in the API function
        // This is just to indicate to the user that the title will be set based on formats
        if (type === 'change') {
          form.setValue('title', 'Will be set based on formats', { shouldDirty: false });
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormatFieldArray form={form} />
        <ExtraCostsField />
        <SavingsField />
        <BasicFormFields 
          form={form} 
          suppliers={suppliers} 
          titleReadOnly={hasFormats || form.getValues('formats')?.length > 0}
        />
        <FormActions
          form={form}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      </form>
    </Form>
  );
}
