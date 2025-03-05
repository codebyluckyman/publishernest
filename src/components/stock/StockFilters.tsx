
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterX, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type FilterProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedWarehouse: string | null;
  setSelectedWarehouse: (warehouseId: string | null) => void;
  selectedProduct: string | null;
  setSelectedProduct: (productId: string | null) => void;
};

const StockFilters = ({
  searchQuery,
  setSearchQuery,
  selectedWarehouse,
  setSelectedWarehouse,
  selectedProduct,
  setSelectedProduct,
}: FilterProps) => {
  const { currentOrganization } = useOrganization();

  // Fetch warehouses for the filter dropdown
  const { data: warehouses } = useQuery({
    queryKey: ["warehouses", currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return [];
      
      const { data, error } = await supabase
        .from("warehouses")
        .select("*")
        .eq("organization_id", currentOrganization.id)
        .order("name");
        
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!currentOrganization
  });

  // Fetch products for the filter dropdown
  const { data: products } = useQuery({
    queryKey: ["products", currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return [];
      
      const { data, error } = await supabase
        .from("products")
        .select("id, title")
        .eq("organization_id", currentOrganization.id)
        .order("title");
        
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!currentOrganization
  });

  const clearFilters = () => {
    setSelectedWarehouse(null);
    setSelectedProduct(null);
    setSearchQuery("");
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 w-full md:w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium">Warehouse</label>
          <Select value={selectedWarehouse || undefined} onValueChange={(value) => setSelectedWarehouse(value || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All warehouses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All warehouses</SelectItem>
              {warehouses?.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium">Product</label>
          <Select value={selectedProduct || undefined} onValueChange={(value) => setSelectedProduct(value || null)}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All products</SelectItem>
              {products?.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {(selectedWarehouse || selectedProduct || searchQuery) && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-auto"
            onClick={clearFilters}
          >
            <FilterX className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>
    </>
  );
};

export default StockFilters;
