
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isPending: boolean;
  onCancel?: () => void;
}

export function FormActions({ isPending, onCancel }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-2">
      {onCancel && (
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
      )}
      <Button 
        type="submit" 
        disabled={isPending}
      >
        {isPending ? "Creating..." : "Create Quote Request"}
      </Button>
    </div>
  );
}
