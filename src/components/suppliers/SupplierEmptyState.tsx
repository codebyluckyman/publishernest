
import { Building, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SupplierEmptyStateProps {
  hasOrganization: boolean;
  onAddSupplier: () => void;
}

export function SupplierEmptyState({ hasOrganization, onAddSupplier }: SupplierEmptyStateProps) {
  return (
    <div className="text-center py-8 text-gray-500 space-y-3">
      <Building className="h-12 w-12 mx-auto text-gray-400" />
      <h3 className="text-lg font-medium">No Suppliers Found</h3>
      <p className="text-sm max-w-md mx-auto">
        {!hasOrganization
          ? "Please select an organization to view suppliers."
          : "Get started by adding your first supplier."}
      </p>
      {hasOrganization && (
        <Button className="mt-4 gap-1" onClick={onAddSupplier}>
          <PlusCircle className="h-4 w-4" />
          Add First Supplier
        </Button>
      )}
    </div>
  );
}
