
import ProductCategories from "@/components/products/ProductCategories";
import ProductsTable from "@/components/products/ProductsTable";

const Products = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Products</h1>
        <p className="text-gray-600">Manage your product catalog and inventory</p>
      </div>

      <ProductCategories />

      <ProductsTable />
    </div>
  );
};

export default Products;
