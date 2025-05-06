import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface QuoteExtraPricingOptionsProps {
  applyProduct1Cost: boolean;
  useSingleCost: boolean;
  onApplyProduct1CostChange: (checked: boolean) => void;
  onUseSingleCostChange: (checked: boolean) => void;
}

export const QuoteExtraPricingOptions: React.FC<
  QuoteExtraPricingOptionsProps
> = ({
  applyProduct1Cost,
  useSingleCost,
  onApplyProduct1CostChange,
  onUseSingleCostChange,
}) => {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-start gap-2">
        <Checkbox
          id="apply-product1-cost"
          checked={applyProduct1Cost}
          onCheckedChange={(checked) =>
            onApplyProduct1CostChange(checked as boolean)
          }
        />
        <Label
          htmlFor="apply-product1-cost"
          className="cursor-pointer font-normal leading-tight"
        >
          Apply Product 1 cost to all products
        </Label>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="use-single-cost"
          checked={useSingleCost}
          onCheckedChange={(checked) =>
            onUseSingleCostChange(checked as boolean)
          }
        />
        <Label
          htmlFor="use-single-cost"
          className="cursor-pointer font-normal leading-tight"
        >
          Use one cost for all price breaks & products
        </Label>
      </div>
    </div>
  );
};
