
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  showFilters,
  setShowFilters,
}: ProductFiltersProps) => {
  const { currentOrganization } = useOrganization();
  const [filterOptions, setFilterOptions] = useState<{
    product_form: string[];
    publisher_name: string[];
  }>({
    product_form: [],
    publisher_name: [],
  });

  // Load filter options
  useQuery({
    queryKey: ["productFilterOptions", currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return null;

      // Fetch product forms
      const { data: productForms } = await supabase
        .from("products")
        .select("product_form")
        .eq("organization_id", currentOrganization.id)
        .not("product_form", "is", null);
      
      // Fetch publishers
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
        publisher_name: publisherOptions,
      });
      
      return { formOptions, publisherOptions };
    },
    enabled: !!currentOrganization,
  });

  const handleFilterChange = (field: keyof FilterOptions, value: string | null) => {
    // Fix: Create a new object instead of using a function that returns one
    const newFilters: FilterOptions = { 
      ...filters, 
      [field]: value === "all" ? null : value 
    };
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters({
      product_form: null,
      publisher_name: null,
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const areFiltersActive = () => {
    return filters.product_form !== null || 
           filters.publisher_name !== null;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full md:w-[260px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="gap-1"
            onClick={toggleFilters}
          >
            Filters {areFiltersActive() && <span className="ml-1 text-xs bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">{Object.values(filters).filter(Boolean).length}</span>}
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filterOptions.product_form.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-1 block">Product Format</label>
                <Select 
                  value={filters.product_form || ""}
                  onValueChange={(value) => handleFilterChange("product_form", value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Formats</SelectItem>
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
                  value={filters.publisher_name || ""}
                  onValueChange={(value) => handleFilterChange("publisher_name", value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Publisher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Publishers</SelectItem>
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
      )}
    </div>
  );
};

export default ProductFilters;
