
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProductTableHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleAddProduct: () => void;
}

const ProductTableHeader = ({ 
  searchQuery, 
  setSearchQuery, 
  handleAddProduct 
}: ProductTableHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div>
        <CardTitle>Products</CardTitle>
        <CardDescription>Manage your product catalog</CardDescription>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-9 w-full md:w-[260px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="gap-1" onClick={handleAddProduct}>
          <PlusCircle className="h-4 w-4" />
          Add Product
        </Button>
      </div>
    </div>
  );
};

export default ProductTableHeader;
