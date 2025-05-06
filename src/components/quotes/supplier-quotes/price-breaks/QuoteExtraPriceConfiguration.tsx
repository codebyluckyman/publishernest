import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { useFormContext } from "react-hook-form";
import { QuoteExtraColumnControl } from "./QuoteExtraColumnControl";
import { QuoteExtraPriceBreaksGrid } from "./QuoteExtraPriceBreaksGrid";
import { QuoteExtraPricingOptions } from "./QuoteExtraPriceOptions";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface QuoteExtraProductConfiguratorProps {
  productName: string;
  description?: string;
  extraCostIndex: number;
  control: any;
}

export const QuoteExtraProductConfigurator: React.FC<
  QuoteExtraProductConfiguratorProps
> = ({ productName, description, extraCostIndex, control }) => {
  const MIN_COLUMNS = 3;
  const MAX_COLUMNS = 10;
  const DEFAULT_COLUMN_COUNT = 3;

  // Quantity breaks
  const quantities = [
    "2,000",
    "2,500",
    "3,000",
    "5,000",
    "7,500",
    "10,000",
    "15,000",
    "20,000",
    "25,000",
  ];

  // State
  const [columnCount, setColumnCount] = useState(DEFAULT_COLUMN_COUNT);
  const [applyProduct1Cost, setApplyProduct1Cost] = useState(false);
  const [useSingleCost, setUseSingleCost] = useState(false);

  const { watch, setValue } = useFormContext();
  const baseUnitCost = watch(`extra_costs.${extraCostIndex}.unit_cost`);

  // Effect to update all price breaks when base unit cost changes
  useEffect(() => {
    if (baseUnitCost !== undefined && baseUnitCost !== null) {
      quantities.forEach((quantity) => {
        const numericQuantity = parseInt(quantity.replace(/,/g, ""), 10);
        for (let i = 1; i <= columnCount; i++) {
          const fieldName = `extra_costs.${extraCostIndex}.price_breaks.${numericQuantity}.unit_cost_${i}`;
          setValue(fieldName, baseUnitCost);
        }
      });
    }
  }, [baseUnitCost, extraCostIndex, setValue, quantities, columnCount]);

  // Handle price changes
  const handlePriceChange = (
    quantity: string,
    titleCount: string,
    value: string
  ) => {
    const numericQuantity = parseInt(quantity.replace(/,/g, ""), 10);
    const fieldName = `extra_costs.${extraCostIndex}.price_breaks.${numericQuantity}.unit_cost_${titleCount}`;
    setValue(fieldName, value ? parseFloat(value) : null);

    // If using single cost, update all values
    if (useSingleCost && value) {
      quantities.forEach((qty) => {
        const numQty = parseInt(qty.replace(/,/g, ""), 10);
        for (let i = 1; i <= columnCount; i++) {
          setValue(
            `extra_costs.${extraCostIndex}.price_breaks.${numQty}.unit_cost_${i}`,
            parseFloat(value)
          );
        }
      });
    }

    // If applying Product 1 cost, update all products for this quantity
    if (applyProduct1Cost && value) {
      for (let i = 2; i <= columnCount; i++) {
        setValue(
          `extra_costs.${extraCostIndex}.price_breaks.${numericQuantity}.unit_cost_${i}`,
          parseFloat(value)
        );
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <QuoteExtraColumnControl
          columnCount={columnCount}
          minColumns={MIN_COLUMNS}
          maxColumns={MAX_COLUMNS}
          onColumnCountChange={setColumnCount}
        />
      </div>

      <QuoteExtraPriceBreaksGrid
        quantities={quantities}
        columnCount={columnCount}
        pricingData={watch(`extra_costs.${extraCostIndex}.price_breaks`) || {}}
        onPriceChange={handlePriceChange}
        useSingleCost={useSingleCost}
        applyProduct1Cost={applyProduct1Cost}
        extraCostIndex={extraCostIndex}
      />

      <QuoteExtraPricingOptions
        applyProduct1Cost={applyProduct1Cost}
        useSingleCost={useSingleCost}
        onApplyProduct1CostChange={setApplyProduct1Cost}
        onUseSingleCostChange={setUseSingleCost}
      />
    </div>
  );
};
