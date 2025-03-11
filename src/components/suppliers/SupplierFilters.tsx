
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
  status: string | null;
};

interface SupplierFiltersProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  showFilters: boolean;
}

export function SupplierFilters({
  filters,
  setFilters,
  showFilters,
}: SupplierFiltersProps) {
  const handleFilterChange = (field: keyof FilterOptions, value: string | null) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: null,
    });
  };

  const areFiltersActive = () => {
    return filters.status !== null;
  };

  if (!showFilters) return null;

  const statusOptions = ["active", "inactive"];

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Status</label>
          <Select 
            value={filters.status || ""}
            onValueChange={(value) => handleFilterChange("status", value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
