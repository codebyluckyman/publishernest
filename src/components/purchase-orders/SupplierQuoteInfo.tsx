import type React from "react";

import { useState, useEffect } from "react";
import type { SupplierQuote } from "@/types/supplierQuote";
import { useSupplierQuotesByProduct } from "@/hooks/useSupplierQuotesByProduct";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChartIcon as ChartBarIcon, Loader2 } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { QuoteComparisonTable } from "./QuoteComparisonTable";

interface SupplierQuoteInfoProps {
  productId?: string;
  formatId?: string;
  supplierId?: string;
  value?: string;
  onChange: (quoteId: string, unitCost: number, supplierId: string) => void;
  disabled?: boolean;
  quantity?: number;
}

export function SupplierQuoteInfo({
  productId,
  formatId,
  supplierId,
  value,
  onChange,
  disabled = false,
  quantity = 0,
}: SupplierQuoteInfoProps) {
  const { quotes, isLoading } = useSupplierQuotesByProduct(
    productId,
    formatId,
    supplierId
  );
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [manualCost, setManualCost] = useState<boolean>(false);
  const [customUnitCost, setCustomUnitCost] = useState<number | null>(null);

  useEffect(() => {
    if (value && value !== "manual") {
      const selectedQuote = quotes.find((quote) => quote.id === value);
      if (selectedQuote) {
        const newUnitCost = findUnitCostForQuantity(selectedQuote, quantity);
        onChange(value, newUnitCost, selectedQuote.supplier_id);
      }
    }
  }, [quantity, value, quotes, onChange]);

  const findUnitCostForQuantity = (
    quote: SupplierQuote,
    orderQuantity: number
  ) => {
    if (!quote.price_breaks?.length) return 0;

    const sortedBreaks = [...quote.price_breaks].sort(
      (a, b) => (a.quantity || 0) - (b.quantity || 0)
    );

    if (orderQuantity === 0) {
      return sortedBreaks[0]?.unit_cost_1 || 0;
    }

    let selectedBreak = sortedBreaks[0];
    for (let i = 0; i < sortedBreaks.length; i++) {
      const currentBreak = sortedBreaks[i];
      const nextBreak = sortedBreaks[i + 1];

      if (!currentBreak.quantity) continue;

      if (
        !nextBreak ||
        (orderQuantity >= currentBreak.quantity &&
          orderQuantity < (nextBreak.quantity || Number.POSITIVE_INFINITY))
      ) {
        selectedBreak = currentBreak;
        break;
      }
    }

    return selectedBreak?.unit_cost_1 || 0;
  };

  const getSelectedQuoteDisplay = () => {
    if (!value) return "";
    if (value === "manual") return "Custom cost";

    const selectedQuote = quotes.find((quote) => quote.id === value);
    if (!selectedQuote) return "";

    const unitCost = findUnitCostForQuantity(selectedQuote, quantity);
    return `${selectedQuote.supplier_name} - ${selectedQuote.title} ($${unitCost.toFixed(2)})`;
  };

  const handleComparisonSelect = (quoteId: string) => {
    const selectedQuote = quotes.find((quote) => quote.id === quoteId);
    if (selectedQuote) {
      const unitCost = findUnitCostForQuantity(selectedQuote, quantity);
      onChange(quoteId, unitCost, selectedQuote.supplier_id);
    }
    setIsComparisonOpen(false);
  };

  const handleQuoteSelection = (quoteId: string) => {
    if (quoteId === "manual") {
      setManualCost(true);
      onChange("manual", customUnitCost || 0, supplierId || "");
      return;
    }
    if (quoteId === "compare") {
      setIsComparisonOpen(true);
      return;
    }

    setManualCost(false);
    const selectedQuote = quotes.find((quote) => quote.id === quoteId);
    if (!selectedQuote) return;

    const unitCost = findUnitCostForQuantity(selectedQuote, quantity);
    onChange(quoteId, unitCost, selectedQuote.supplier_id);
  };

  const handleManualCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cost = Number.parseFloat(e.target.value) || 0;
    setCustomUnitCost(cost);
    onChange("manual", cost, supplierId || "");
  };

  if (!productId) {
    return (
      <div className="text-sm text-muted-foreground">
        Select a product first
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading quotes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Dialog open={isComparisonOpen} onOpenChange={setIsComparisonOpen}>
        <div className="flex gap-2">
          <Select
            disabled={disabled}
            value={value || ""}
            onValueChange={handleQuoteSelection}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select cost source">
                {getSelectedQuoteDisplay()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {quotes.length > 1 && (
                <>
                  <DialogTrigger asChild>
                    <SelectItem value="compare">
                      <div className="flex items-center gap-2">
                        <ChartBarIcon className="h-4 w-4" />
                        Compare Quotes
                      </div>
                    </SelectItem>
                  </DialogTrigger>
                  <SelectSeparator />
                </>
              )}
              {quotes.map((quote) => {
                const unitCost = findUnitCostForQuantity(quote, quantity);
                return (
                  <SelectItem key={quote.id} value={quote.id}>
                    {quote.supplier_name} - {quote.title} ($
                    {unitCost.toFixed(2)})
                  </SelectItem>
                );
              })}
              <SelectSeparator />
              <SelectItem value="manual">Custom cost</SelectItem>
            </SelectContent>
          </Select>

          {quotes.length > 1 && (
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Compare
              </Button>
            </DialogTrigger>
          )}
        </div>

        <QuoteComparisonTable
          quotes={quotes}
          formatId={formatId}
          onQuoteSelect={handleComparisonSelect}
        />
      </Dialog>

      {manualCost && (
        <Input
          type="number"
          min="0"
          step="0.01"
          value={customUnitCost || ""}
          onChange={handleManualCostChange}
          placeholder="Enter custom cost"
          disabled={disabled}
        />
      )}
    </div>
  );
}
