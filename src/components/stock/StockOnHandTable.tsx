
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilterX, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const formatCurrency = (price: number | null) => {
    if (price === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getProductFormLabel = (form: string | null) => {
    if (!form) return "N/A";
    
    const formMap: Record<string, string> = {
      "BA": "Book",
      "BB": "Hardcover",
      "BC": "Paperback",
      "JB": "Journal",
      "DG": "Electronic",
      "XA": "Custom",
    };
    
    return formMap[form] || form;
  };

  const clearFilters = () => {
    setSelectedWarehouse(null);
    setSelectedProduct(null);
    setSearchQuery("");
  };

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <CardTitle>Stock On Hand</CardTitle>
          
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
            <Select value={selectedWarehouse || ""} onValueChange={(value) => setSelectedWarehouse(value || null)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All warehouses</SelectItem>
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
            <Select value={selectedProduct || ""} onValueChange={(value) => setSelectedProduct(value || null)}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All products</SelectItem>
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
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">Loading stock information...</TableCell>
              </TableRow>
            ) : stockItems?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">No stock records found</TableCell>
              </TableRow>
            ) : (
              stockItems?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product_title}</TableCell>
                  <TableCell>{item.product_isbn13 || "—"}</TableCell>
                  <TableCell>
                    {item.product_form ? (
                      <Badge variant="secondary">
                        {getProductFormLabel(item.product_form)}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{item.warehouse_name}</TableCell>
                  <TableCell>{item.warehouse_location || "—"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.list_price)}</TableCell>
                  <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                  <TableCell className="text-right font-medium">
                    {item.list_price 
                      ? formatCurrency(item.list_price * item.quantity)
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StockOnHandTable;
