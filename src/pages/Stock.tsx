
import { useState } from "react";
import StockOnHandOverview from "@/components/stock/StockOnHandOverview";
import StockOnHandTable from "@/components/stock/StockOnHandTable";

const Stock = () => {
  return (
    <div className="space-y-6">
      <StockOnHandOverview />
      <StockOnHandTable />
    </div>
  );
};

export default Stock;
