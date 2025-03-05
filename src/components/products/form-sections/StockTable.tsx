
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Warehouse } from "lucide-react";

type StockEntry = {
  id: string;
  warehouse_id: string;
  warehouse_name: string;
  warehouse_location: string | null;
  quantity: number;
};

type StockTableProps = {
  productId: string;
  readOnly?: boolean;
  onChange?: (warehouseId: string, quantity: number) => void;
};

export const StockTable = ({ productId, readOnly = false, onChange }: StockTableProps) => {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Fetch warehouses and stock information
  const { data: warehousesWithStock, isLoading } = useQuery({
    queryKey: ["warehousesWithStock", productId],
    queryFn: async () => {
      if (!productId) return [];

      // First get all warehouses for the organization
      const { data: productData } = await supabase
        .from("products")
        .select("organization_id")
        .eq("id", productId)
        .single();

      if (!productData) return [];

      const { data: warehouses } = await supabase
        .from("warehouses")
        .select("*")
        .eq("organization_id", productData.organization_id);

      if (!warehouses) return [];

      // Then get stock info for this product across all warehouses
      const { data: stockData } = await supabase
        .from("stock_on_hand")
        .select("*")
        .eq("product_id", productId);

      // Combine the data
      return warehouses.map(warehouse => {
        const stockEntry = stockData?.find(entry => entry.warehouse_id === warehouse.id);
        return {
          id: stockEntry?.id || `temp-${warehouse.id}`,
          warehouse_id: warehouse.id,
          warehouse_name: warehouse.name,
          warehouse_location: warehouse.location,
          quantity: stockEntry?.quantity || 0
        };
      });
    },
    enabled: !!productId
  });

  // Update local state when data is fetched
  useEffect(() => {
    if (warehousesWithStock) {
      setStockEntries(warehousesWithStock);
      
      // Initialize quantities state
      const newQuantities: Record<string, number> = {};
      warehousesWithStock.forEach(entry => {
        newQuantities[entry.warehouse_id] = entry.quantity;
      });
      setQuantities(newQuantities);
    }
  }, [warehousesWithStock]);

  // Handle quantity change
  const handleQuantityChange = (warehouseId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    setQuantities(prev => ({
      ...prev,
      [warehouseId]: quantity
    }));

    if (onChange) {
      onChange(warehouseId, quantity);
    }
  };

  // Save the updated stock quantities to the database
  const saveStockQuantities = async (productId: string, organizationId: string) => {
    const upsertPromises = stockEntries.map(entry => {
      return supabase
        .from("stock_on_hand")
        .upsert({
          product_id: productId,
          warehouse_id: entry.warehouse_id,
          organization_id: organizationId,
          quantity: quantities[entry.warehouse_id] || 0
        }, { onConflict: 'product_id, warehouse_id' });
    });

    await Promise.all(upsertPromises);
  };

  if (isLoading) {
    return <div>Loading inventory information...</div>;
  }

  if (!stockEntries || stockEntries.length === 0) {
    return (
      <div className="text-center py-4 border rounded-md">
        <Warehouse className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500">No warehouses found. Add warehouses in the Organization settings.</p>
      </div>
    );
  }

  // Calculate total inventory
  const totalInventory = stockEntries.reduce((sum, entry) => {
    return sum + (quantities[entry.warehouse_id] || entry.quantity);
  }, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Inventory</h3>
        <Badge variant="outline" className="font-medium">
          Total: {totalInventory} units
        </Badge>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Warehouse</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stockEntries.map((entry) => (
            <TableRow key={entry.warehouse_id}>
              <TableCell className="font-medium">{entry.warehouse_name}</TableCell>
              <TableCell>{entry.warehouse_location || "-"}</TableCell>
              <TableCell className="text-right">
                {readOnly ? (
                  quantities[entry.warehouse_id] || entry.quantity
                ) : (
                  <Input
                    type="number"
                    min="0"
                    value={quantities[entry.warehouse_id] || entry.quantity}
                    onChange={(e) => handleQuantityChange(entry.warehouse_id, e.target.value)}
                    className="w-24 ml-auto"
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Add a public method to the component
StockTable.saveStockQuantities = async (productId: string, organizationId: string) => {
  // This is a placeholder - in actual implementation we would need to get the quantities
  // We'll handle this in the form component
};
