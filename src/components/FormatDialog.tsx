
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import FormatForm from "./FormatForm";
import { LinkedProductsGallery } from "./format/LinkedProductsGallery";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, FileText } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { CreateQuoteRequestFromFormat } from "./quotes/CreateQuoteRequestFromFormat";

type FormatDialogProps = {
  open: boolean;
  formatId?: string | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const FormatDialog = ({ open, formatId, onOpenChange, onSuccess }: FormatDialogProps) => {
  const isEditMode = !!formatId;
  const [isLoading, setIsLoading] = useState(false);
  const formatFormRef = useRef<{ deleteFormat: () => Promise<void> } | null>(null);
  
  // Debug log to check formatId
  useEffect(() => {
    console.log("FormatDialog isEditMode:", isEditMode, "formatId:", formatId);
  }, [isEditMode, formatId]);
  
  const handleSuccess = () => {
    // Ensure onSuccess is called to trigger the table refresh
    onSuccess();
    // Then close the dialog
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleDelete = async () => {
    console.log("Dialog handleDelete called, formatFormRef:", formatFormRef.current);
    if (formatFormRef.current) {
      await formatFormRef.current.deleteFormat();
    }
    // Make sure onSuccess is called after deletion
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between sticky top-0 bg-background z-10 pb-2 border-b">
          <DialogTitle>{isEditMode ? "Edit Format" : "Add New Format"}</DialogTitle>
          <div className="flex space-x-2">
            {isEditMode && formatId && (
              <>
                <CreateQuoteRequestFromFormat
                  formatId={formatId}
                  buttonVariant="outline"
                  buttonText="Create Quote Request"
                />
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
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            <Button variant="outline" type="button" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="format-form" 
              disabled={isLoading} 
              variant={isEditMode ? "success" : "default"}
            >
              {isLoading ? "Saving..." : isEditMode ? "Update Format" : "Create Format"}
            </Button>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 pt-4">
          <FormatForm 
            formatId={formatId || undefined} 
            onSuccess={handleSuccess} 
            onCancel={handleCancel}
            onDelete={handleDelete}
            formId="format-form"
            setIsLoading={setIsLoading}
            hideButtons={true}
            ref={formatFormRef}
          />
          
          {isEditMode && formatId && (
            <>
              <Separator className="my-4" />
              <LinkedProductsGallery formatId={formatId} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormatDialog;
