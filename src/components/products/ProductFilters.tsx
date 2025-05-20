
import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MultiSelectFilter, MultiSelectOption } from "@/components/common/MultiSelectFilter";
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
  ALL_SERIES: "ALL_SERIES",
};

type FilterOptions = {
  product_form: string | string[];
  publisher_name: string | string[];
  pub_month: string | string[] | null;
  license: string | string[] | null;
  format_id: string | string[] | null;
  series_name: string | string[] | null;
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
    format_id: [],
    series_name: [] 
  } } = useQuery({
    queryKey: ["productFilterOptions", currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization)
        return { 
          product_form: [], 
          publisher_name: [],
          pub_month: [],
          license: [],
          format_id: [],
          series_name: []
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
        
      // Fetch series names
      const { data: series } = await supabase
        .from("products")
        .select("series_name")
        .eq("organization_id", currentOrganization.id)
        .not("series_name", "is", null);

      const formOptions = Array.from(
        new Set(
          productForms?.map((p) => p.product_form).filter(Boolean) || []
        )
      ) as string[];

      const publisherOptions = Array.from(
        new Set(
          publishers?.map((p) => p.publisher_name).filter(Boolean) || []
        )
      ).sort() as string[];  // Sort alphabetically
      
      // Process publication dates to extract month-year
      const pubMonthsUnsorted = Array.from(
        new Set(
          pubDates?.map(p => {
            if (!p.publication_date) return null;
            const date = new Date(p.publication_date);
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          }).filter(Boolean) || []
        )
      );
      
      // Helper function to convert month-year string to Date for sorting
      const parseMonthYear = (monthYear: string) => {
        const [month, year] = monthYear.split(' ');
        const monthIndex = new Date(Date.parse(`${month} 1, 2000`)).getMonth();
        return new Date(parseInt(year), monthIndex, 1);
      };
      
      // Sort publication months chronologically
      const pubMonthOptions = pubMonthsUnsorted.sort((a, b) => {
        const dateA = parseMonthYear(a);
        const dateB = parseMonthYear(b);
        return dateA.getTime() - dateB.getTime();
      });
      
      const licenseOptions = Array.from(
        new Set(
          licenses?.map(p => p.license).filter(Boolean) || []
        )
      ).sort();  // Sort alphabetically
      
      const formatOptions = formats?.map(format => ({
        id: format.id,
        name: format.format_name
      })).sort((a, b) => a.name.localeCompare(b.name)) || [];  // Sort alphabetically by format name
      
      // Sort series names alphabetically
      const seriesOptions = Array.from(
        new Set(
          series?.map(p => p.series_name).filter(Boolean) || []
        )
      ).sort();

      return {
        product_form: formOptions,
        publisher_name: publisherOptions,
        pub_month: pubMonthOptions,
        license: licenseOptions,
        format_id: formatOptions,
        series_name: seriesOptions,
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
  
  const handleMultiFilterChange = (field: keyof FilterOptions, values: string[]) => {
    setFilters({
      ...filters,
      [field]: values.length === 0 || 
               (values.length === 1 && values[0] === getDefaultValueForField(field))
        ? getDefaultValueForField(field)
        : values
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
      case 'series_name':
        return FILTER_VALUES.ALL_SERIES;
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
      series_name: FILTER_VALUES.ALL_SERIES,
    });
  };

  const areFiltersActive = () => {
    return (
      filters.product_form !== FILTER_VALUES.ALL_FORMATS ||
      filters.publisher_name !== FILTER_VALUES.ALL_PUBLISHERS ||
      filters.pub_month !== FILTER_VALUES.ALL_PUB_MONTHS ||
      filters.license !== FILTER_VALUES.ALL_LICENSES ||
      filters.format_id !== FILTER_VALUES.ALL_FORMAT_NAMES ||
      filters.series_name !== FILTER_VALUES.ALL_SERIES
    );
  };

  if (!showFilters) return null;

  // Create options arrays for filters
  const productFormOptions: MultiSelectOption[] = [
    { value: FILTER_VALUES.ALL_FORMATS, label: "All Formats" },
    ...filterOptions.product_form.map((option) => ({
      value: option,
      label: option,
    })),
  ];

  const publisherOptions: MultiSelectOption[] = [
    { value: FILTER_VALUES.ALL_PUBLISHERS, label: "All Publishers" },
    ...filterOptions.publisher_name.map((option) => ({
      value: option,
      label: option,
    })),
  ];
  
  const pubMonthOptions: MultiSelectOption[] = [
    { value: FILTER_VALUES.ALL_PUB_MONTHS, label: "All Publication Months" },
    ...filterOptions.pub_month.map((option) => ({
      value: option,
      label: option,
    })),
  ];
  
  const licenseOptions: MultiSelectOption[] = [
    { value: FILTER_VALUES.ALL_LICENSES, label: "All Licenses" },
    ...filterOptions.license.map((option) => ({
      value: option,
      label: option,
    })),
  ];
  
  const formatOptions: MultiSelectOption[] = [
    { value: FILTER_VALUES.ALL_FORMAT_NAMES, label: "All Format Names" },
    ...filterOptions.format_id.map((option) => ({
      value: option.id,
      label: option.name,
    })),
  ];
  
  // Add series options
  const seriesOptions: MultiSelectOption[] = [
    { value: FILTER_VALUES.ALL_SERIES, label: "All Series" },
    ...filterOptions.series_name.map((option) => ({
      value: option,
      label: option,
    })),
  ];
  
  const normalizeSingleOrArrayValue = (value: string | string[] | null, defaultValue: string): string[] => {
    if (!value) return [defaultValue];
    if (Array.isArray(value)) return value;
    return [value];
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filterOptions.product_form.length > 0 && (
          <MultiSelectFilter
            label="Product Format"
            value={normalizeSingleOrArrayValue(filters.product_form, FILTER_VALUES.ALL_FORMATS)}
            onChange={(values) => handleMultiFilterChange("product_form", values)}
            options={productFormOptions}
            placeholder="Select Format"
            emptyValue={FILTER_VALUES.ALL_FORMATS}
            allOptionValue={FILTER_VALUES.ALL_FORMATS}
          />
        )}

        {filterOptions.publisher_name.length > 0 && (
          <MultiSelectFilter
            label="Publisher"
            value={normalizeSingleOrArrayValue(filters.publisher_name, FILTER_VALUES.ALL_PUBLISHERS)}
            onChange={(values) => handleMultiFilterChange("publisher_name", values)}
            options={publisherOptions}
            placeholder="Select Publisher"
            emptyValue={FILTER_VALUES.ALL_PUBLISHERS}
            allOptionValue={FILTER_VALUES.ALL_PUBLISHERS}
          />
        )}
        
        {filterOptions.pub_month.length > 0 && (
          <MultiSelectFilter
            label="Publication Month"
            value={normalizeSingleOrArrayValue(filters.pub_month, FILTER_VALUES.ALL_PUB_MONTHS)}
            onChange={(values) => handleMultiFilterChange("pub_month", values)}
            options={pubMonthOptions}
            placeholder="Select Publication Month"
            emptyValue={FILTER_VALUES.ALL_PUB_MONTHS}
            allOptionValue={FILTER_VALUES.ALL_PUB_MONTHS}
          />
        )}
        
        {filterOptions.license.length > 0 && (
          <MultiSelectFilter
            label="License"
            value={normalizeSingleOrArrayValue(filters.license, FILTER_VALUES.ALL_LICENSES)}
            onChange={(values) => handleMultiFilterChange("license", values)}
            options={licenseOptions}
            placeholder="Select License"
            emptyValue={FILTER_VALUES.ALL_LICENSES}
            allOptionValue={FILTER_VALUES.ALL_LICENSES}
          />
        )}
        
        {filterOptions.format_id.length > 0 && (
          <MultiSelectFilter
            label="Format Name"
            value={normalizeSingleOrArrayValue(filters.format_id, FILTER_VALUES.ALL_FORMAT_NAMES)}
            onChange={(values) => handleMultiFilterChange("format_id", values)}
            options={formatOptions}
            placeholder="Select Format Name"
            emptyValue={FILTER_VALUES.ALL_FORMAT_NAMES}
            allOptionValue={FILTER_VALUES.ALL_FORMAT_NAMES}
          />
        )}
        
        {filterOptions.series_name.length > 0 && (
          <MultiSelectFilter
            label="Series"
            value={normalizeSingleOrArrayValue(filters.series_name, FILTER_VALUES.ALL_SERIES)}
            onChange={(values) => handleMultiFilterChange("series_name", values)}
            options={seriesOptions}
            placeholder="Select Series"
            emptyValue={FILTER_VALUES.ALL_SERIES}
            allOptionValue={FILTER_VALUES.ALL_SERIES}
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
