
import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductSearch } from "./ProductSearch";
import { toast } from "sonner";
import { ProductLine, ProductSearchResult } from "./types";

interface ProductLineFormProps {
  onAddProductLine: (productLine: ProductLine) => void;
  selectedFormatIds: string[];
}

export function ProductLineForm({ onAddProductLine, selectedFormatIds }: ProductLineFormProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductTitle, setSelectedProductTitle] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");

  const handleSelectProduct = (product: ProductSearchResult) => {
    setSelectedProductId(product.id);
    setSelectedProductTitle(product.title);
  };

  const handleAddProductLine = () => {
    if (!selectedProductId || !selectedProductTitle) {
      toast.error('Please select a product');
      return;
    }
    
    // Add to UI state
    const newLine: ProductLine = {
      product_id: selectedProductId,
      product_title: selectedProductTitle,
      quantity: quantity,
      notes: notes
    };
    
    onAddProductLine(newLine);
    
    // Reset form
    setSelectedProductId(null);
    setSelectedProductTitle("");
    setQuantity(1);
    setNotes("");
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="flex-1">
        <ProductSearch
          selectedProductId={selectedProductId}
          selectedProductTitle={selectedProductTitle}
          onSelectProduct={handleSelectProduct}
          selectedFormatIds={selectedFormatIds}
        />
      </div>
      
      <div className="w-24">
        <Input
          type="number"
          min="1"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
        />
      </div>
      
      <div className="flex-1">
        <Input
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      
      <Button onClick={handleAddProductLine} disabled={!selectedProductId}>
        <Plus className="h-4 w-4 mr-1" /> Add
      </Button>
    </div>
  );
}
