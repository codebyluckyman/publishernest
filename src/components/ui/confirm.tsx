
import React from "react";
import { createRoot } from "react-dom/client";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmOptions {
  title: string;
  description: string;
  cancelText?: string;
  confirmText?: string;
}

// Promise-based confirm dialog that returns true if the user confirms
export const confirm = (options: ConfirmOptions): Promise<boolean> => {
  const { 
    title, 
    description, 
    cancelText = "Cancel", 
    confirmText = "Delete" 
  } = options;

  return new Promise((resolve) => {
    // Create container for the dialog
    const containerElement = document.createElement("div");
    document.body.appendChild(containerElement);
    
    // Create root
    const root = createRoot(containerElement);
    
    // Function to remove the component and clean up
    const cleanup = () => {
      root.unmount();
      if (containerElement.parentNode) {
        containerElement.parentNode.removeChild(containerElement);
      }
    };

    // Render component with callbacks
    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    // Render the AlertDialog
    root.render(
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  });
};
