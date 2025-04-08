
import { useState, useMemo } from "react";

export type FilterValue = string;
export type FiltersState = Record<string, FilterValue>;
export type FilterConfig = Record<string, { all: string; label: string }>;

export function useFilters<T extends FiltersState>(
  initialFilters: T,
  filterConfig: FilterConfig
) {
  const [filters, setFilters] = useState<T>(initialFilters);

  // Get a list of all "ALL" values for resetting filters
  const allValues = useMemo(() => {
    return Object.entries(filterConfig).reduce((acc, [key, config]) => {
      acc[key] = config.all;
      return acc;
    }, {} as Record<string, string>);
  }, [filterConfig]);

  // Handle filter change
  const handleFilterChange = (field: keyof T, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value === (filterConfig[field as string]?.all || "ALL") ? filterConfig[field as string]?.all : value,
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // Check if any filters are active
  const areFiltersActive = () => {
    return Object.entries(filters).some(([key, value]) => {
      return value !== allValues[key];
    });
  };

  return {
    filters,
    setFilters,
    handleFilterChange,
    resetFilters,
    areFiltersActive,
  };
}
