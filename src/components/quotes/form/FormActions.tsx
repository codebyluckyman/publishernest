
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { QuoteRequestFormValues } from "./schema";

interface FormActionsProps {
  form: UseFormReturn<QuoteRequestFormValues>;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export function FormActions({ form, isSubmitting, onCancel }: FormActionsProps) {
  const isEditMode = form.getValues().id !== undefined;

  return (
    <div className="flex justify-end space-x-2">
      {onCancel && (
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
      )}
      <Button 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 
          (isEditMode ? "Updating..." : "Creating...") : 
          (isEditMode ? "Update Quote Request" : "Create Quote Request")
        }
      </Button>
    </div>
  );
}
