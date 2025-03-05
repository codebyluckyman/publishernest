
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import StockFilters from "./StockFilters";
import StockTable from "./StockTable";
import StockGroupedTable from "./StockGroupedTable";
import { objectsToCSV, downloadCSV } from "@/lib/csv-utils";

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

// Create a separate type for CSV export that doesn't extend StockItem
// This avoids the type conflict with list_price
type StockItemCSV = {
  id: string;
  quantity: number;
  warehouse_id: string;
  warehouse_name: string;
  warehouse_location: string;
  product_id: string;
  product_title: string;
  product_isbn13: string;
  product_form: string;
  list_price: string;
  total_value: string;
};

const StockOnHandTable = () => {
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"detailed" | "grouped">("grouped");

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

  const handleDownloadCSV = () => {
    if (!stockItems || stockItems.length === 0) return;
    
    const columns: { key: keyof StockItemCSV; label: string }[] = [
      { key: 'product_title', label: 'Product' },
      { key: 'product_isbn13', label: 'ISBN' },
      { key: 'product_form', label: 'Format' },
      { key: 'warehouse_name', label: 'Warehouse' },
      { key: 'warehouse_location', label: 'Location' },
      { key: 'list_price', label: 'Unit Price' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'total_value', label: 'Total Value' },
    ];
    
    // Convert all values to strings for the CSV
    const csvData: StockItemCSV[] = stockItems.map(item => ({
      ...item,
      product_isbn13: item.product_isbn13 || 'N/A',
      product_form: item.product_form || 'N/A',
      warehouse_location: item.warehouse_location || 'N/A',
      // Convert all numeric values to strings to avoid type conflicts
      list_price: item.list_price !== null ? item.list_price.toString() : 'N/A',
      total_value: item.list_price !== null ? (item.list_price * item.quantity).toString() : 'N/A'
    }));
    
    const csvContent = objectsToCSV(csvData, columns);
    const today = new Date().toISOString().slice(0, 10);
    const filename = `${currentOrganization.name}-stock-inventory-${today}.csv`;
    
    downloadCSV(csvContent, filename);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <CardTitle>Stock On Hand</CardTitle>
          
          {viewMode === "detailed" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownloadCSV}
              disabled={!stockItems || stockItems.length === 0 || isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
        
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
