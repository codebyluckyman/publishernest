
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
import { useEffect, useState } from "react";
import { useFormatsForSelect } from "@/hooks/useFormatsForSelect";
import { useOrganization } from "@/hooks/useOrganization";

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
  const { currentOrganization } = useOrganization();
  const { data: formats = [] } = useFormatsForSelect(currentOrganization);
  const [formatNames, setFormatNames] = useState<Record<string, string>>({});

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

  // Load format names from the formats data
  useEffect(() => {
    if (formats.length > 0) {
      const namesMap: Record<string, string> = {};
      formats.forEach(format => {
        namesMap[format.id] = format.format_name;
      });
      setFormatNames(namesMap);
    }
  }, [formats]);

  // When formats change, update the title
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name?.startsWith('formats') && type === 'change') {
        const formData = form.getValues();
        const formatsList = formData.formats || [];
        
        if (formatsList.length > 0) {
          // Get format names for the selected format IDs
          const selectedFormatNames = formatsList
            .map(format => format.format_id ? formatNames[format.format_id] : null)
            .filter(Boolean);
          
          if (selectedFormatNames.length > 0) {
            const newTitle = `QR for ${selectedFormatNames.join(', ')}`;
            form.setValue('title', newTitle, { shouldDirty: true });
          }
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, formatNames]);

  const handleFormSubmit = (data: QuoteRequestFormValues) => {
    // Set default title if none is provided or if formats are selected
    if (!data.title || data.formats?.length) {
      const formatsList = data.formats || [];
      if (formatsList.length > 0) {
        // Get format names for the selected format IDs
        const selectedFormatNames = formatsList
          .map(format => format.format_id ? formatNames[format.format_id] : null)
          .filter(Boolean);
        
        if (selectedFormatNames.length > 0) {
          data.title = `QR for ${selectedFormatNames.join(', ')}`;
        } else {
          data.title = `Quote Request - ${new Date().toLocaleDateString()}`;
        }
      } else {
        data.title = `Quote Request - ${new Date().toLocaleDateString()}`;
      }
    }
    
    console.log("Form submission data:", data);
    onSubmit(data);
  };

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
