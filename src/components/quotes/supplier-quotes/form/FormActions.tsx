
// Update the FormActions component to support different modes
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  isValid: boolean;
  mode?: 'create' | 'edit';
}

export function FormActions({ isSubmitting, onCancel, isValid, mode = 'create' }: FormActionsProps) {
  const saveButtonLabel = mode === 'create' ? "Save Draft" : "Save Changes";
  
  return (
    <div className="flex justify-end space-x-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        <X className="mr-2 h-4 w-4" />
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
      >
        <Save className="mr-2 h-4 w-4" />
        {saveButtonLabel}
      </Button>
    </div>
  );
}
