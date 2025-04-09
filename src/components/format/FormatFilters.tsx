
import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectFilter, FilterOption } from "@/components/common/SelectFilter";

// Constants for filter values
export const FILTER_VALUES = {
  ALL_STOCK: "ALL_STOCK"
};

export type FilterOptions = {
  cover_stock_print: string;
  internal_stock_print: string;
};

type FilterOptionsValues = {
  cover_stock_print: string[];
  internal_stock_print: string[];
};

interface FormatFiltersProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  filterOptions: FilterOptionsValues;
  showFilters: boolean;
  resetFilters: () => void;
}

export function FormatFilters({
  filters,
  setFilters,
  filterOptions,
  showFilters,
  resetFilters,
}: FormatFiltersProps) {
  const handleFilterChange = (field: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      [field]: value === FILTER_VALUES.ALL_STOCK ? FILTER_VALUES.ALL_STOCK : value 
    }));
  };

  const areFiltersActive = () => {
    return filters.cover_stock_print !== FILTER_VALUES.ALL_STOCK || 
           filters.internal_stock_print !== FILTER_VALUES.ALL_STOCK;
  };

  if (!showFilters) return null;

  // Create options arrays for select filters
  const coverStockOptions: FilterOption[] = [
    { value: FILTER_VALUES.ALL_STOCK, label: "All Cover Stock" },
    ...filterOptions.cover_stock_print.map(option => ({ 
      value: option, 
      label: option 
    }))
  ];

  const internalStockOptions: FilterOption[] = [
    { value: FILTER_VALUES.ALL_STOCK, label: "All Internal Stock" },
    ...filterOptions.internal_stock_print.map(option => ({ 
      value: option, 
      label: option 
    }))
  ];

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filterOptions.cover_stock_print.length > 0 && (
          <SelectFilter
            label="Cover Stock/Print"
            value={filters.cover_stock_print}
            onValueChange={(value) => handleFilterChange("cover_stock_print", value)}
            options={coverStockOptions}
            placeholder="Select Cover Stock"
          />
        )}

        {filterOptions.internal_stock_print.length > 0 && (
          <SelectFilter
            label="Internal Stock/Print"
            value={filters.internal_stock_print}
            onValueChange={(value) => handleFilterChange("internal_stock_print", value)}
            options={internalStockOptions}
            placeholder="Select Internal Stock"
          />
        )}
      </div>

      {areFiltersActive() && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={resetFilters}
            size="sm" 
            className="gap-1"
          >
            <FilterX className="h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
