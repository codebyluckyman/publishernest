
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteRequestFormSchema, QuoteRequestFormValues } from "./form/schema";
import { BasicFormFields } from "./form/BasicFormFields";
import { FormatFieldArray } from "./form/FormatFieldArray";
import { FormActions } from "./form/FormActions";
import { Supplier } from "@/types/supplier";
import { Form } from "@/components/ui/form";
import { QuoteRequest } from "@/types/quoteRequest";

interface QuoteRequestFormProps {
  onSubmit: (data: QuoteRequestFormValues) => void;
  suppliers: Supplier[];
  initialValues?: Partial<QuoteRequestFormValues & { id?: string }>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function QuoteRequestForm({
  onSubmit,
  suppliers,
  initialValues,
  isSubmitting,
  onCancel,
}: QuoteRequestFormProps) {
  // Create form with validation schema and default values
  const form = useForm<QuoteRequestFormValues>({
    resolver: zodResolver(quoteRequestFormSchema),
    defaultValues: {
      id: initialValues?.id,
      title: initialValues?.title || "",
      supplier_ids: initialValues?.supplier_ids || [],
      description: initialValues?.description || "",
      due_date: initialValues?.due_date,
      notes: initialValues?.notes || "",
      formats: initialValues?.formats || [],
      products: initialValues?.products || {},
      quantities: initialValues?.quantities || {},
      supplier_id: initialValues?.supplier_id, // For backward compatibility
    },
  });

  const handleFormSubmit = (data: QuoteRequestFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <BasicFormFields form={form} suppliers={suppliers} />
        <FormatFieldArray form={form} />
        <FormActions
          form={form}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      </form>
    </Form>
  );
}
