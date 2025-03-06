
import { Form } from "@/components/ui/form";
import { useFormatForm } from "@/hooks/useFormatForm";
import { FormatFormFields } from "./form/FormatFormFields";

type FormatReadOnlyFormProps = {
  formatId: string;
};

export default function FormatReadOnlyForm({ formatId }: FormatReadOnlyFormProps) {
  const { form, isLoading } = useFormatForm({ 
    formatId, 
    onSuccess: () => {} 
  });

  // Set all fields to readOnly
  const allFields = form.getValues();
  Object.keys(allFields).forEach(fieldName => {
    form.getFieldState(fieldName as any);
    const field = form.getValues(fieldName as any);
    if (field !== undefined) {
      form.register(fieldName as any, { disabled: true });
    }
  });

  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormatFormFields form={form} readOnly={true} />
      </div>
    </Form>
  );
}
