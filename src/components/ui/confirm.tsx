
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { createRoot } from "react-dom/client";

interface ConfirmOptions {
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  destructive?: boolean;
}

export function confirm(options: ConfirmOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    const confirmRoot = document.createElement("div");
    document.body.appendChild(confirmRoot);
    
    const { 
      title = "Confirm Action",
      description = "Are you sure you want to proceed?",
      cancelText = "Cancel",
      confirmText = "Confirm",
      destructive = false,
    } = options;
    
    const cleanup = () => {
      document.body.removeChild(confirmRoot);
    };

    const ConfirmDialog = () => {
      const [open, setOpen] = useState(true);

      const handleCancel = () => {
        setOpen(false);
        resolve(false);
        setTimeout(cleanup, 100);
      };
      
      const handleConfirm = () => {
        setOpen(false);
        resolve(true);
        setTimeout(cleanup, 100);
      };
      
      return (
        <AlertDialog open={open} onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleCancel();
          }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancel}>{cancelText}</AlertDialogCancel>
              <AlertDialogAction 
                className={destructive ? "bg-red-600 hover:bg-red-700" : undefined} 
                onClick={handleConfirm}
              >
                {confirmText}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    };
    
    createRoot(confirmRoot).render(<ConfirmDialog />);
  });
}
