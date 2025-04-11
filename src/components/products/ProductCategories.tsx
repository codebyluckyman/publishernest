
import { Grid } from "lucide-react";
import ActiveProductsCard from "./ActiveProductsCard";

interface ProductCategoriesProps {
  onAddProduct?: () => void;
}

const ProductCategories = ({ onAddProduct = () => {} }: ProductCategoriesProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <ActiveProductsCard onClick={onAddProduct} />
    </div>
  );
};

export default ProductCategories;
