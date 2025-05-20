
import ProductCategories from "@/components/products/ProductCategories";
import { EditableProductTableContainer } from "@/components/products/EditableProductTableContainer";

const Products = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Products</h1>
        <p className="text-gray-600">Manage your product catalog and inventory</p>
      </div>

      <ProductCategories />

      <EditableProductTableContainer />
    </div>
  );
};

export default Products;
