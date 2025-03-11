
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { QuoteRequest } from "@/types/quoteRequest";
import { useFormatsApi } from "@/hooks/useFormatsApi";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";
import { BasicDetailsSection } from "./form/BasicDetailsSection";
import { StatusSection } from "./form/StatusSection";
import { DueDateSection } from "./form/DueDateSection";
import { FormatSelection } from "./form/FormatSelection";
import { ProductLinesSection } from "./form/ProductLinesSection";

const quoteRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  status: z.enum(["draft", "open", "closed"]),
  due_date: z.date().nullable().optional(),
  format_ids: z.array(z.string()).optional(),
  product_lines: z.array(
    z.object({
      product_id: z.string(),
      product_title: z.string().optional(),
      quantity: z.number().min(1),
      notes: z.string().optional()
    })
  ).optional()
});

type QuoteRequestFormValues = z.infer<typeof quoteRequestSchema>;

interface QuoteRequestFormProps {
  quoteRequest?: QuoteRequest;
  onSubmit: (data: QuoteRequestFormValues) => void;
  isSubmitting: boolean;
}

export function QuoteRequestForm({ quoteRequest, onSubmit, isSubmitting }: QuoteRequestFormProps) {
  const { currentOrganization } = useOrganization();
  const { fetchQuoteRequestFormats } = useFormatsApi(currentOrganization);
  const [initialFormatIds, setInitialFormatIds] = useState<string[]>([]);

  const form = useForm<QuoteRequestFormValues>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      title: quoteRequest?.title || "",
      description: quoteRequest?.description || "",
      status: quoteRequest?.status || "draft",
      due_date: quoteRequest?.due_date ? new Date(quoteRequest.due_date) : null,
      format_ids: [],
      product_lines: []
    },
  });

  // Fetch linked formats when editing an existing quote request
  useEffect(() => {
    const loadLinkedFormats = async () => {
      if (quoteRequest?.id) {
        const formatIds = await fetchQuoteRequestFormats(quoteRequest.id);
        setInitialFormatIds(formatIds);
        form.setValue('format_ids', formatIds);
      }
    };

    loadLinkedFormats();
  }, [quoteRequest?.id, fetchQuoteRequestFormats, form]);

  const handleSubmitWithFormats = async (data: QuoteRequestFormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Failed to save quote request");
    }
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitWithFormats)} className="space-y-6">
          <BasicDetailsSection />
          <StatusSection />
          <DueDateSection />
          <FormatSelection 
            organizationId={currentOrganization?.id} 
            initialFormatIds={initialFormatIds} 
          />
          
          {quoteRequest?.id && (
            <ProductLinesSection quoteRequestId={quoteRequest.id} />
          )}

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={isSubmitting}>
              {quoteRequest ? 'Update Quote Request' : 'Create Quote Request'}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
