
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductLineForm } from "./product-lines/ProductLineForm";
import { ProductLinesList } from "./product-lines/ProductLinesList";
import { useProductLines } from "./product-lines/useProductLines";

export function ProductLinesSection({ quoteRequestId }: { quoteRequestId?: string }) {
  const { watch } = useFormContext();
  const { productLines, addProductLine, removeProductLine } = useProductLines(quoteRequestId);
  
  // Watch format_ids to filter products by selected formats
  const selectedFormatIds = watch('format_ids') || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Lines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ProductLineForm 
            onAddProductLine={addProductLine}
            selectedFormatIds={selectedFormatIds}
          />
          
          <ProductLinesList 
            productLines={productLines}
            onRemove={removeProductLine}
          />
        </div>
      </CardContent>
    </Card>
  );
}
