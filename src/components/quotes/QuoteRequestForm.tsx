import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteRequestFormSchema, QuoteRequestFormValues } from "./form/schema";
import { BasicFormFields } from "./form/BasicFormFields";
import { FormatFieldArray } from "./form/FormatFieldArray";
import { FormActions } from "./form/FormActions";
import { ProductionScheduleField } from "./form/ProductionScheduleField";
import { AttachmentsField } from "./form/AttachmentsField";
import { Supplier } from "@/types/supplier";
import { Form } from "@/components/ui/form";
import { useEffect, useState } from "react";
import { useFormatsForSelect } from "@/hooks/useFormatsForSelect";
import { useOrganization } from "@/hooks/useOrganization";
import { CostsAndSavingsTabsField } from "./form/CostsAndSavingsTabsField";

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
  const { formats = [] } = useFormatsForSelect();
  const [formatNames, setFormatNames] = useState<Record<string, string>>({});

  console.log("Quote Request Form initialValues:", initialValues);
  console.log("Savings from initialValues:", initialValues?.savings);

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
      production_schedule_requested: initialValues?.production_schedule_requested || false,
      required_step_id: initialValues?.required_step_id || null,
      required_step_date: initialValues?.required_step_date || null,
      attachments: [],
    },
    mode: "onChange"
  });

  useEffect(() => {
    console.log("Form values after initialization:", form.getValues());
    console.log("Savings in form:", form.getValues("savings"));
  }, [form]);

  useEffect(() => {
    if (formats.length > 0) {
      const namesMap: Record<string, string> = {};
      formats.forEach(format => {
        namesMap[format.id] = format.format_name;
      });
      setFormatNames(namesMap);
    }
  }, [formats]);

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name?.startsWith('formats') && type === 'change') {
        const formData = form.getValues();
        const formatsList = formData.formats || [];
        
        if (formatsList.length > 0) {
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

  const handleFormSubmit = async (data: QuoteRequestFormValues) => {
    console.log("Attempting to submit form with data:", data);
    
    if (!data.title && data.formats?.length) {
      const formatsList = data.formats || [];
      if (formatsList.length > 0) {
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
    
    if (!data.supplier_ids || data.supplier_ids.length === 0) {
      console.error("No suppliers selected");
      form.setError("supplier_ids", { 
        type: "manual", 
        message: "At least one supplier must be selected" 
      });
      return;
    }
    
    console.log("Form submission data:", data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormatFieldArray form={form} />
        <CostsAndSavingsTabsField />
        <ProductionScheduleField />
        <AttachmentsField />
        <BasicFormFields 
          titleReadOnly={hasFormats || form.getValues('formats')?.length > 0}
          suppliers={suppliers}
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
