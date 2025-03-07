
import { BookOpen, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductEmptyStateProps {
  hasOrganization: boolean;
  onAddProduct: () => void;
}

export function ProductEmptyState({ hasOrganization, onAddProduct }: ProductEmptyStateProps) {
  return (
    <div className="text-center py-8 text-gray-500 space-y-3">
      <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
      <h3 className="text-lg font-medium">No Products Found</h3>
      <p className="text-sm max-w-md mx-auto">
        {!hasOrganization
          ? "Please select an organization to view products."
          : "Get started by adding your first product to the catalog."}
      </p>
      {hasOrganization && (
        <Button className="mt-4 gap-1" onClick={onAddProduct}>
          <PlusCircle className="h-4 w-4" />
          Add First Product
        </Button>
      )}
    </div>
  );
}
