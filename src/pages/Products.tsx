
import { useState } from "react";
import ProductCategories from "@/components/products/ProductCategories";
import { ProductTableContainer } from "@/components/products/ProductTableContainer";
import ProductDialog from "@/components/ProductDialog";

const Products = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleAddProduct = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Products</h1>
        <p className="text-gray-600">Manage your product catalog and inventory</p>
      </div>

      <ProductCategories onAddProduct={handleAddProduct} />

      <ProductTableContainer />

      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default Products;
