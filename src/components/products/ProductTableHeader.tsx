import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { useMemo, useState } from "react";
import { debounce } from "lodash";

interface ProductTableHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showFilters: boolean;
  toggleFilters: () => void;
  onAddProduct: () => void;
  areFiltersActive: () => boolean;
  activeFiltersCount: number;
}

export function ProductTableHeader({
  searchQuery,
  setSearchQuery,
  showFilters,
  toggleFilters,
  onAddProduct,
  areFiltersActive,
  activeFiltersCount,
}: ProductTableHeaderProps) {
  const [inputValue, setInputValue] = useState(searchQuery);

  const debouncedSetSearchQuery = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 500),
    [setSearchQuery]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetSearchQuery(value);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div>
        <CardTitle>Products</CardTitle>
        <CardDescription>Manage your product catalog</CardDescription>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full md:w-[260px]"
            value={inputValue}
            onChange={handleInputChange}
          />
        </div>
        <Button variant="outline" className="gap-1" onClick={toggleFilters}>
          Filters{" "}
          {areFiltersActive() && (
            <span className="ml-1 text-xs bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
        <Button className="gap-1" onClick={onAddProduct}>
          <PlusCircle className="h-4 w-4" />
          Add Product
        </Button>
      </div>
    </div>
  );
}
