
import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useProductEdit } from "@/context/ProductEditContext";
import { formatDate } from "@/utils/productUtils";
import { cn } from "@/lib/utils";

interface EditableDateCellProps {
  value: string | null;
  productId: string;
  fieldName: string;
}

export function EditableDateCell({ value, productId, fieldName }: EditableDateCellProps) {
  const { isEditMode, updateProductField, isSaving, currentlySavingProduct, currentlySavingField } = useProductEdit();
  const [date, setDate] = useState<Date | undefined>(value ? new Date(value) : undefined);
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    setDate(value ? new Date(value) : undefined);
  }, [value]);

  const isCurrentlySaving = isSaving && currentlySavingProduct === productId && currentlySavingField === fieldName;

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      updateProductField(productId, fieldName, formattedDate);
      setOpen(false);
    } else {
      updateProductField(productId, fieldName, null);
      setOpen(false);
    }
  };

  if (!isEditMode) return <span>{formatDate(value)}</span>;

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "h-8 justify-start text-left font-normal min-w-[140px]",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'MMM d, yyyy') : <span>Select date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {isCurrentlySaving && (
        <div className="absolute right-2 top-1">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
