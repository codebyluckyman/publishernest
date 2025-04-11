import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useSuppliersApi } from "@/hooks/useSuppliersApi";
import { useOrganization } from "@/context/OrganizationContext";
import { Supplier, SupplierFormValues } from "@/types/supplier";
import { SupplierForm } from "./SupplierForm";

interface SupplierDialogProps {
  open: boolean;
  supplierId?: string | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SupplierDialog({
  open,
  supplierId,
  onOpenChange,
  onSuccess,
}: SupplierDialogProps) {
  const { currentOrganization } = useOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const { getSupplier, createSupplier, updateSupplier, deleteSupplier } =
    useSuppliersApi(currentOrganization);

  const isEditMode = Boolean(supplierId);

  // Memoize the loadSupplier function
  const loadSupplier = useCallback(async () => {
    if (!supplierId) return;

    setIsLoading(true);
    try {
      const data = await getSupplier(supplierId);
      setSupplier(data);
    } catch (error) {
      console.error("Error loading supplier:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supplierId, getSupplier]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSupplier(null);
      setIsLoading(false);
    } else if (isEditMode && !supplier) {
      // Only load supplier data when opening in edit mode and no data is present
      loadSupplier();
    }
  }, [open, isEditMode, supplier, loadSupplier]);

  const handleSubmit = async (data: SupplierFormValues) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isEditMode && supplierId) {
        await updateSupplier.mutateAsync({ id: supplierId, ...data });
      } else {
        await createSupplier.mutateAsync(data);
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving supplier:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!supplierId || isLoading) return;

    setIsLoading(true);
    try {
      await deleteSupplier.mutateAsync(supplierId);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting supplier:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isLoading) return;
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between sticky top-0 bg-background z-10 pb-2 border-b">
          <DialogTitle>
            {isEditMode ? "Edit Supplier" : "Add New Supplier"}
          </DialogTitle>
          {isEditMode && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this supplier and cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isLoading}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pt-4">
          <SupplierForm
            key={`${supplierId || "new"}-${open}`}
            supplier={supplier}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
