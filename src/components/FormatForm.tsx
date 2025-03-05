
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormatFormFields } from "./form/FormatFormFields";
import { useFormatForm } from "@/hooks/useFormatForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Dispatch, SetStateAction, useEffect } from "react";

type FormatFormProps = {
  formatId?: string;
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  formId?: string;
  setIsLoading?: Dispatch<SetStateAction<boolean>>;
  hideButtons?: boolean;
};

export default function FormatForm({ 
  formatId, 
  onSuccess, 
  onCancel, 
  onDelete,
  formId = "format-form",
  setIsLoading: setParentIsLoading,
  hideButtons = false
}: FormatFormProps) {
  const { form, isLoading, isEditMode, onSubmit, deleteFormat } = useFormatForm({ 
    formatId, 
    onSuccess 
  });

  // Log to debug
  console.log("FormatForm: isEditMode =", isEditMode, "formatId =", formatId);

  // Sync loading state with parent if provided
  useEffect(() => {
    if (setParentIsLoading) {
      setParentIsLoading(isLoading);
    }
  }, [isLoading, setParentIsLoading]);

  const handleDelete = async () => {
    if (formatId) {
      await deleteFormat();
      if (onDelete) onDelete();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id={formId}>
        <FormatFormFields form={form} />
        
        {!hideButtons && (
          <div className="flex justify-end space-x-2">
            {formatId && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" type="button" disabled={isLoading}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this format and cannot be undone. This may also affect products that use this format.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              variant={formatId ? "success" : "default"}
            >
              {isLoading ? "Saving..." : formatId ? "Update Format" : "Create Format"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
