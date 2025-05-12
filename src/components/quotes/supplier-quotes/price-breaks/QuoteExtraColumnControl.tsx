import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface ColumnControllerProps {
  columnCount: number;
  minColumns: number;
  maxColumns: number;
  onColumnCountChange: (count: number) => void;
}

export const QuoteExtraColumnControl: React.FC<ColumnControllerProps> = ({
  columnCount,
  minColumns,
  maxColumns,
  onColumnCountChange,
}) => {
  const handleDecreaseColumns = () => {
    if (columnCount > minColumns) {
      onColumnCountChange(columnCount - 1);
    }
  };

  const handleIncreaseColumns = () => {
    if (columnCount < maxColumns) {
      onColumnCountChange(columnCount + 1);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-muted-foreground">
        Title Columns:
      </span>
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-r-none"
          onClick={handleDecreaseColumns}
          disabled={columnCount <= minColumns}
        >
          <Minus className="h-4 w-4" />
          <span className="sr-only">Decrease columns</span>
        </Button>
        <div className="flex h-8 min-w-[3rem] items-center justify-center border-y bg-background px-3 text-sm">
          {columnCount}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-l-none"
          onClick={handleIncreaseColumns}
          disabled={columnCount >= maxColumns}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Increase columns</span>
        </Button>
      </div>
    </div>
  );
};
