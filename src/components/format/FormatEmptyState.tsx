
import { Package, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormatEmptyStateProps {
  hasOrganization: boolean;
  onAddFormat: () => void;
}

export function FormatEmptyState({ hasOrganization, onAddFormat }: FormatEmptyStateProps) {
  return (
    <div className="text-center py-8 text-gray-500 space-y-3">
      <Package className="h-12 w-12 mx-auto text-gray-400" />
      <h3 className="text-lg font-medium">No Formats Found</h3>
      <p className="text-sm max-w-md mx-auto">
        {!hasOrganization
          ? "Please select an organization to view formats."
          : "Get started by adding your first format."}
      </p>
      {hasOrganization && (
        <Button className="mt-4 gap-1" onClick={onAddFormat}>
          <PlusCircle className="h-4 w-4" />
          Add First Format
        </Button>
      )}
    </div>
  );
}
