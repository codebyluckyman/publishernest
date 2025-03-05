
import { useState } from "react";
import StockOnHandOverview from "@/components/stock/StockOnHandOverview";
import StockOnHandTable from "@/components/stock/StockOnHandTable";

const Stock = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Stock Management</h1>
        <p className="text-gray-600">Track and manage your inventory across warehouses</p>
      </div>

      <StockOnHandOverview />
      
      <StockOnHandTable />
    </div>
  );
};

export default Stock;
