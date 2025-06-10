
import ProductCategories from "@/components/products/ProductCategories";
import { EditableProductTableContainer } from "@/components/products/EditableProductTableContainer";
import { ProductEditProvider } from "@/context/ProductEditContext";

const Products = () => {
  return (
    <ProductEditProvider>
      <EditableProductTableContainer />
    </ProductEditProvider>
  );
};

export default Products;
