import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectFilter, FilterOption } from "@/components/common/SelectFilter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";

// Constants for filter values
export const FILTER_VALUES = {
  ALL_FORMATS: "ALL_FORMATS",
  ALL_PUBLISHERS: "ALL_PUBLISHERS",
};

type FilterOptions = {
  product_form: string;
  publisher_name: string;
};

interface ProductFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const ProductFilters = ({
  filters,
  setFilters,
  showFilters,
}: ProductFiltersProps) => {
  const { currentOrganization } = useOrganization();

  console.log("currentOrganization", currentOrganization);

  const { data: filterOptions = { product_form: [], publisher_name: [] } } =
    useQuery({
      queryKey: ["productFilterOptions", currentOrganization?.id],
      queryFn: async () => {
        if (!currentOrganization)
          return { product_form: [], publisher_name: [] };

        const { data: productForms } = await supabase
          .from("products")
          .select("product_form")
          .eq("organization_id", currentOrganization.id)
          .not("product_form", "is", null);

        const { data: publishers } = await supabase
          .from("products")
          .select("publisher_name")
          .eq("organization_id", currentOrganization.id)
          .not("publisher_name", "is", null);

        const formOptions = Array.from(
          new Set(
            productForms?.map((p) => p.product_form).filter(Boolean) || []
          )
        ) as string[];

        const publisherOptions = Array.from(
          new Set(
            publishers?.map((p) => p.publisher_name).filter(Boolean) || []
          )
        ) as string[];

        return {
          product_form: formOptions,
          publisher_name: publisherOptions,
        };
      },
      enabled: !!currentOrganization,
    });

  const handleFilterChange = (field: keyof FilterOptions, value: string) => {
    setFilters({
      ...filters,
      [field]:
        value ===
        (field === "product_form"
          ? FILTER_VALUES.ALL_FORMATS
          : FILTER_VALUES.ALL_PUBLISHERS)
          ? field === "product_form"
            ? FILTER_VALUES.ALL_FORMATS
            : FILTER_VALUES.ALL_PUBLISHERS
          : value,
    });
  };

  const resetFilters = () => {
    setFilters({
      product_form: FILTER_VALUES.ALL_FORMATS,
      publisher_name: FILTER_VALUES.ALL_PUBLISHERS,
    });
  };

  const areFiltersActive = () => {
    return (
      filters.product_form !== FILTER_VALUES.ALL_FORMATS ||
      filters.publisher_name !== FILTER_VALUES.ALL_PUBLISHERS
    );
  };

  if (!showFilters) return null;

  // Create options arrays for select filters
  const productFormOptions: FilterOption[] = [
    { value: FILTER_VALUES.ALL_FORMATS, label: "All Formats" },
    ...filterOptions.product_form.map((option) => ({
      value: option,
      label: option,
    })),
  ];

  const publisherOptions: FilterOption[] = [
    { value: FILTER_VALUES.ALL_PUBLISHERS, label: "All Publishers" },
    ...filterOptions.publisher_name.map((option) => ({
      value: option,
      label: option,
    })),
  ];

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filterOptions.product_form.length > 0 && (
          <SelectFilter
            label="Product Format"
            value={filters.product_form}
            onValueChange={(value) => handleFilterChange("product_form", value)}
            options={productFormOptions}
            placeholder="Select Format"
          />
        )}

        {filterOptions.publisher_name.length > 0 && (
          <SelectFilter
            label="Publisher"
            value={filters.publisher_name}
            onValueChange={(value) =>
              handleFilterChange("publisher_name", value)
            }
            options={publisherOptions}
            placeholder="Select Publisher"
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
};

export default ProductFilters;
