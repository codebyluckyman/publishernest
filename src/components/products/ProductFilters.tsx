
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
  ALL_PUB_MONTHS: "ALL_PUB_MONTHS",
  ALL_LICENSES: "ALL_LICENSES",
  ALL_FORMAT_NAMES: "ALL_FORMAT_NAMES",
};

type FilterOptions = {
  product_form: string;
  publisher_name: string;
  pub_month: string | null;
  license: string | null;
  format_id: string | null;
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

  const { data: filterOptions = { 
    product_form: [], 
    publisher_name: [],
    pub_month: [],
    license: [],
    format_id: [] 
  } } = useQuery({
    queryKey: ["productFilterOptions", currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization)
        return { 
          product_form: [], 
          publisher_name: [],
          pub_month: [],
          license: [],
          format_id: [] 
        };

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
        
      // Fetch publication dates
      const { data: pubDates } = await supabase
        .from("products")
        .select("publication_date")
        .eq("organization_id", currentOrganization.id)
        .not("publication_date", "is", null);
        
      // Fetch licenses
      const { data: licenses } = await supabase
        .from("products")
        .select("license")
        .eq("organization_id", currentOrganization.id)
        .not("license", "is", null);
        
      // Fetch formats
      const { data: formats } = await supabase
        .from("formats")
        .select("id, format_name")
        .eq("organization_id", currentOrganization.id);

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
      
      // Process publication dates to extract month-year
      const pubMonthOptions = Array.from(
        new Set(
          pubDates?.map(p => {
            if (!p.publication_date) return null;
            const date = new Date(p.publication_date);
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          }).filter(Boolean) || []
        )
      ).sort();
      
      const licenseOptions = Array.from(
        new Set(
          licenses?.map(p => p.license).filter(Boolean) || []
        )
      );
      
      const formatOptions = formats?.map(format => ({
        id: format.id,
        name: format.format_name
      })) || [];

      return {
        product_form: formOptions,
        publisher_name: publisherOptions,
        pub_month: pubMonthOptions,
        license: licenseOptions,
        format_id: formatOptions,
      };
    },
    enabled: !!currentOrganization,
  });

  const handleFilterChange = (field: keyof FilterOptions, value: string) => {
    setFilters({
      ...filters,
      [field]:
        value === getDefaultValueForField(field)
          ? getDefaultValueForField(field)
          : value,
    });
  };

  const getDefaultValueForField = (field: keyof FilterOptions) => {
    switch(field) {
      case 'product_form':
        return FILTER_VALUES.ALL_FORMATS;
      case 'publisher_name':
        return FILTER_VALUES.ALL_PUBLISHERS;
      case 'pub_month':
        return FILTER_VALUES.ALL_PUB_MONTHS;
      case 'license':
        return FILTER_VALUES.ALL_LICENSES;
      case 'format_id':
        return FILTER_VALUES.ALL_FORMAT_NAMES;
      default:
        return null;
    }
  };

  const resetFilters = () => {
    setFilters({
      product_form: FILTER_VALUES.ALL_FORMATS,
      publisher_name: FILTER_VALUES.ALL_PUBLISHERS,
      pub_month: FILTER_VALUES.ALL_PUB_MONTHS,
      license: FILTER_VALUES.ALL_LICENSES,
      format_id: FILTER_VALUES.ALL_FORMAT_NAMES,
    });
  };

  const areFiltersActive = () => {
    return (
      filters.product_form !== FILTER_VALUES.ALL_FORMATS ||
      filters.publisher_name !== FILTER_VALUES.ALL_PUBLISHERS ||
      filters.pub_month !== FILTER_VALUES.ALL_PUB_MONTHS ||
      filters.license !== FILTER_VALUES.ALL_LICENSES ||
      filters.format_id !== FILTER_VALUES.ALL_FORMAT_NAMES
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
  
  const pubMonthOptions: FilterOption[] = [
    { value: FILTER_VALUES.ALL_PUB_MONTHS, label: "All Publication Months" },
    ...filterOptions.pub_month.map((option) => ({
      value: option,
      label: option,
    })),
  ];
  
  const licenseOptions: FilterOption[] = [
    { value: FILTER_VALUES.ALL_LICENSES, label: "All Licenses" },
    ...filterOptions.license.map((option) => ({
      value: option,
      label: option,
    })),
  ];
  
  const formatOptions: FilterOption[] = [
    { value: FILTER_VALUES.ALL_FORMAT_NAMES, label: "All Format Names" },
    ...filterOptions.format_id.map((option) => ({
      value: option.id,
      label: option.name,
    })),
  ];

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        
        {filterOptions.pub_month.length > 0 && (
          <SelectFilter
            label="Publication Month"
            value={filters.pub_month || FILTER_VALUES.ALL_PUB_MONTHS}
            onValueChange={(value) => handleFilterChange("pub_month", value)}
            options={pubMonthOptions}
            placeholder="Select Publication Month"
          />
        )}
        
        {filterOptions.license.length > 0 && (
          <SelectFilter
            label="License"
            value={filters.license || FILTER_VALUES.ALL_LICENSES}
            onValueChange={(value) => handleFilterChange("license", value)}
            options={licenseOptions}
            placeholder="Select License"
          />
        )}
        
        {filterOptions.format_id.length > 0 && (
          <SelectFilter
            label="Format Name"
            value={filters.format_id || FILTER_VALUES.ALL_FORMAT_NAMES}
            onValueChange={(value) => handleFilterChange("format_id", value)}
            options={formatOptions}
            placeholder="Select Format Name"
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
