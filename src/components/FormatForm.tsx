
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormatFormFields } from "./form/FormatFormFields";
import { useFormatForm } from "@/hooks/useFormatForm";

type FormatFormProps = {
  formatId?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function FormatForm({ formatId, onSuccess, onCancel }: FormatFormProps) {
  const { form, isLoading, isEditMode, onSubmit } = useFormatForm({ 
    formatId, 
    onSuccess 
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormatFormFields form={form} />
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditMode ? "Update Format" : "Create Format"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
