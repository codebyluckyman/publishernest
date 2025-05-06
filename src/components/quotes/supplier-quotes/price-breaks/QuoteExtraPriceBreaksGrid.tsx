import React, { useMemo } from "react";
import { QuoteExtraPriceInput } from "./QuoteExtraPriceInput";
import { cn } from "@/lib/utils";

export interface PricingData {
  [quantity: string]: {
    [titleCount: string]: string;
  };
}

interface QuoteExtraPriceGridProps {
  quantities: string[];
  columnCount: number;
  pricingData: PricingData;
  onPriceChange: (quantity: string, titleCount: string, value: string) => void;
  useSingleCost: boolean;
  applyProduct1Cost: boolean;
  extraCostIndex?: number;
}

export const QuoteExtraPriceBreaksGrid: React.FC<QuoteExtraPriceGridProps> = ({
  quantities,
  columnCount,
  pricingData,
  onPriceChange,
  useSingleCost,
  applyProduct1Cost,
  extraCostIndex,
}) => {
  // Generate column headers (1 Title, 2 Titles, etc.)
  const columnHeaders = useMemo(() => {
    return Array.from(
      { length: columnCount },
      (_, i) => `${i + 1} ${i === 0 ? "Title" : "Titles"}`
    );
  }, [columnCount]);

  return (
    <div className="mt-4 rounded-md border">
      <div
        className="grid items-center gap-4 border-b bg-muted/40 p-4"
        style={{ gridTemplateColumns: `1fr repeat(${columnCount}, 1fr)` }}
      >
        <div className="font-medium text-muted-foreground">Quantity</div>
        {columnHeaders.map((header) => (
          <div
            key={header}
            className="font-medium text-muted-foreground text-center"
          >
            {header}
          </div>
        ))}
      </div>

      <div className="divide-y">
        {quantities.map((quantity, index) => {
          const numericQuantity = parseInt(quantity.replace(/,/g, ""), 10);

          return (
            <div
              key={quantity}
              className={cn(
                "grid gap-4 p-4 transition-all",
                index % 2 === 0 ? "bg-background" : "bg-muted/20"
              )}
              style={{ gridTemplateColumns: `1fr repeat(${columnCount}, 1fr)` }}
            >
              <div className="flex items-center font-medium">{quantity}</div>

              {columnHeaders.map((_, colIndex) => {
                const titleCount = `${colIndex + 1}`;
                const isDisabled =
                  (useSingleCost && !(colIndex === 0 && index === 0)) ||
                  (applyProduct1Cost && colIndex > 0);

                const value =
                  pricingData[numericQuantity]?.[`unit_cost_${titleCount}`] ||
                  "";

                return (
                  <div key={`${quantity}-${titleCount}`} className="px-1">
                    <QuoteExtraPriceInput
                      id={`price-${quantity}-${titleCount}`}
                      value={value.toString()}
                      onChange={(value) =>
                        onPriceChange(quantity, titleCount, value)
                      }
                      disabled={isDisabled}
                      subIndex={colIndex + 1}
                      extraCostIndex={extraCostIndex}
                      quantityIndex={index}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
