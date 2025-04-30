import { FilterX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectFilter, FilterOption } from "@/components/common/SelectFilter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Constants for filter values
export const FILTER_VALUES = {
  ALL_STOCK: "ALL_STOCK",
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
    setFilters((prev) => ({
      ...prev,
      [field]:
        value === FILTER_VALUES.ALL_STOCK ? FILTER_VALUES.ALL_STOCK : value,
    }));
  };

  const areFiltersActive = () => {
    return (
      filters.cover_stock_print !== FILTER_VALUES.ALL_STOCK ||
      filters.internal_stock_print !== FILTER_VALUES.ALL_STOCK
    );
  };

  if (!showFilters) return null;

  // Create options arrays for select filters
  const coverStockOptions: FilterOption[] = [
    { value: FILTER_VALUES.ALL_STOCK, label: "All Cover Stock" },
    ...filterOptions.cover_stock_print.map((option) => ({
      value: option,
      label: option,
    })),
  ];

  const internalStockOptions: FilterOption[] = [
    { value: FILTER_VALUES.ALL_STOCK, label: "All Internal Stock" },
    ...filterOptions.internal_stock_print.map((option) => ({
      value: option,
      label: option,
    })),
  ];

  return (
    <div className="px-6 py-3 border-b bg-muted/30">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <SelectFilter
            label="Cover Stock/Print"
            value={filters.cover_stock_print}
            onValueChange={(value) =>
              handleFilterChange("cover_stock_print", value)
            }
            options={coverStockOptions}
            placeholder="Select Cover Stock"
          />

          <SelectFilter
            label="Internal Stock/Print"
            value={filters.internal_stock_print}
            onValueChange={(value) =>
              handleFilterChange("internal_stock_print", value)
            }
            options={internalStockOptions}
            placeholder="Select Internal Stock"
          />
        </div>
        <div className="flex items-center justify-end">
          {areFiltersActive() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <FilterX className="h-3.5 w-3.5" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
