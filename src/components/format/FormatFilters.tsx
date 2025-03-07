
import { useState } from "react";
import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FilterOptions = {
  tps: string | null;
  cover_stock_print: string | null;
  internal_stock_print: string | null;
};

type FilterOptionsValues = {
  tps: string[];
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
  const handleFilterChange = (field: keyof FilterOptions, value: string | null) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const areFiltersActive = () => {
    return filters.cover_stock_print !== null || 
           filters.internal_stock_print !== null;
  };

  if (!showFilters) return null;

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filterOptions.cover_stock_print.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-1 block">Cover Stock/Print</label>
            <Select 
              value={filters.cover_stock_print || ""}
              onValueChange={(value) => handleFilterChange("cover_stock_print", value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Cover Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {filterOptions.cover_stock_print.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {filterOptions.internal_stock_print.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-1 block">Internal Stock/Print</label>
            <Select 
              value={filters.internal_stock_print || ""}
              onValueChange={(value) => handleFilterChange("internal_stock_print", value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Internal Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {filterOptions.internal_stock_print.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
