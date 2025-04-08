import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";

type FilterOptions = {
  product_form: string | null;
  publisher_name: string | null;
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
  const [filterOptions, setFilterOptions] = useState<{
    product_form: string[];
    publisher_name: string[];
  }>({
    product_form: [],
    publisher_name: []
  });

  useQuery({
    queryKey: ["productFilterOptions", currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return null;

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
        new Set(productForms?.map(p => p.product_form).filter(Boolean) || [])
      ) as string[];
      
      const publisherOptions = Array.from(
        new Set(publishers?.map(p => p.publisher_name).filter(Boolean) || [])
      ) as string[];

      setFilterOptions({
        product_form: formOptions,
        publisher_name: publisherOptions
      });

      return {
        formOptions,
        publisherOptions
      };
    },
    enabled: !!currentOrganization
  });

  const handleFilterChange = (field: keyof FilterOptions, value: string) => {
    setFilters({
      ...filters,
      [field]: value === "ALL_FORMATS" ? null : value
    });
  };

  const resetFilters = () => {
    setFilters({
      product_form: null,
      publisher_name: null
    });
  };

  const areFiltersActive = () => {
    return filters.product_form !== null || filters.publisher_name !== null;
  };

  if (!showFilters) return null;

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filterOptions.product_form.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-1 block">Product Format</label>
            <Select 
              value={filters.product_form || "ALL_FORMATS"}
              onValueChange={(value) => handleFilterChange("product_form", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_FORMATS">All Formats</SelectItem>
                {filterOptions.product_form.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {filterOptions.publisher_name.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-1 block">Publisher</label>
            <Select 
              value={filters.publisher_name || "ALL_PUBLISHERS"}
              onValueChange={(value) => handleFilterChange("publisher_name", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Publisher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_PUBLISHERS">All Publishers</SelectItem>
                {filterOptions.publisher_name.map((option) => (
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
};

export default ProductFilters;
