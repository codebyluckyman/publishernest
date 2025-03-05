
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, DollarSign, CircleDollarSign } from "lucide-react";

const StockOnHandOverview = () => {
  const { currentOrganization } = useOrganization();

  const { data: stockStats, isLoading } = useQuery({
    queryKey: ["stockStats", currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return null;

      // Get all stock on hand records
      const { data: stockData, error } = await supabase
        .from("stock_on_hand")
        .select(`
          quantity,
          product_id,
          products (
            list_price
          )
        `)
        .eq("organization_id", currentOrganization.id);

      if (error) throw new Error(error.message);

      // Get all products to calculate on order (TODO: placeholder for now)
      const { data: productData } = await supabase
        .from("products")
        .select("id, list_price")
        .eq("organization_id", currentOrganization.id);

      // Calculate summary statistics
      const totalStockOnHand = stockData.reduce((total, item) => total + (item.quantity || 0), 0);
      
      // Calculate the value of stock on hand
      const stockValue = stockData.reduce((total, item) => {
        const productPrice = item.products?.list_price || 0;
        return total + (item.quantity || 0) * Number(productPrice);
      }, 0);

      // For now, these are placeholder values since we don't have an orders table yet
      const stockOnOrder = 0;
      const stockOnOrderValue = 0;

      return {
        totalStockOnHand,
        stockValue,
        stockOnOrder,
        stockOnOrderValue
      };
    },
    enabled: !!currentOrganization
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stock On Hand</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "Loading..." : stockStats?.totalStockOnHand.toLocaleString() || 0}
          </div>
          <p className="text-xs text-muted-foreground">Total units in stock</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "Loading..." : formatCurrency(stockStats?.stockValue || 0)}
          </div>
          <p className="text-xs text-muted-foreground">Total value of inventory</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stock On Order</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "Loading..." : stockStats?.stockOnOrder.toLocaleString() || 0}
          </div>
          <p className="text-xs text-muted-foreground">Units in incoming orders</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">On Order Value</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "Loading..." : formatCurrency(stockStats?.stockOnOrderValue || 0)}
          </div>
          <p className="text-xs text-muted-foreground">Value of incoming inventory</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockOnHandOverview;
