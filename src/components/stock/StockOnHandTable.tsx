
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StockFilters from "./StockFilters";
import StockTable from "./StockTable";
import StockGroupedTable from "./StockGroupedTable";

type StockItem = {
  id: string;
  quantity: number;
  warehouse_id: string;
  warehouse_name: string;
  warehouse_location: string | null;
  product_id: string;
  product_title: string;
  product_isbn13: string | null;
  product_form: string | null;
  list_price: number | null;
};

const StockOnHandTable = () => {
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"detailed" | "grouped">("grouped");

  // Fetch stock on hand data with relationships
  const { data: stockItems, isLoading } = useQuery({
    queryKey: ["stockItems", currentOrganization?.id, selectedWarehouse, selectedProduct, searchQuery],
    queryFn: async () => {
      if (!currentOrganization) return [];
      
      let query = supabase
        .from("stock_on_hand")
        .select(`
          id,
          quantity,
          warehouse_id,
          warehouses (
            name,
            location
          ),
          product_id,
          products (
            title,
            isbn13,
            product_form,
            list_price
          )
        `)
        .eq("organization_id", currentOrganization.id);
        
      if (selectedWarehouse) {
        query = query.eq("warehouse_id", selectedWarehouse);
      }
      
      if (selectedProduct) {
        query = query.eq("product_id", selectedProduct);
      }
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      // Transform and filter the data
      const formattedData = data.map(item => ({
        id: item.id,
        quantity: item.quantity,
        warehouse_id: item.warehouse_id,
        warehouse_name: item.warehouses?.name || "Unknown",
        warehouse_location: item.warehouses?.location || null,
        product_id: item.product_id,
        product_title: item.products?.title || "Unknown",
        product_isbn13: item.products?.isbn13 || null,
        product_form: item.products?.product_form || null,
        list_price: item.products?.list_price || null
      }));
      
      // Apply search filter if any
      if (searchQuery) {
        return formattedData.filter(item => 
          item.product_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.product_isbn13 && item.product_isbn13.includes(searchQuery)) ||
          item.warehouse_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      return formattedData;
    },
    enabled: !!currentOrganization
  });

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-4">
        <CardTitle>Stock On Hand</CardTitle>
        
        <StockFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedWarehouse={selectedWarehouse}
          setSelectedWarehouse={setSelectedWarehouse}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
        />

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "detailed" | "grouped")} className="w-[400px]">
          <TabsList>
            <TabsTrigger value="grouped">Grouped by ISBN</TabsTrigger>
            <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        {viewMode === "grouped" ? (
          <StockGroupedTable stockItems={stockItems} isLoading={isLoading} />
        ) : (
          <StockTable stockItems={stockItems} isLoading={isLoading} />
        )}
      </CardContent>
    </Card>
  );
};

export default StockOnHandTable;
