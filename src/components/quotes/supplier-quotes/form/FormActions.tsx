
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  isValid: boolean;
}

export function FormActions({ isSubmitting, onCancel, isValid }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting ? "Saving..." : "Save as Draft"}
      </Button>
    </div>
  );
}
