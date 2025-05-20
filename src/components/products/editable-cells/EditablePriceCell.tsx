
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { useProductEdit } from "@/context/ProductEditContext";
import { debounce } from "lodash";
import { Loader2 } from "lucide-react";
import { formatPrice } from "@/utils/productUtils";

interface EditablePriceCellProps {
  value: number | null;
  productId: string;
  fieldName: string;
  currencyCode?: string | null;
}

export function EditablePriceCell({ value, productId, fieldName, currencyCode = "USD" }: EditablePriceCellProps) {
  const { isEditMode, updateProductField, isSaving, currentlySavingProduct, currentlySavingField } = useProductEdit();
  const [localValue, setLocalValue] = useState<string>(value !== null ? String(value) : '');
  const [isDirty, setIsDirty] = useState(false);
  
  useEffect(() => {
    setLocalValue(value !== null ? String(value) : '');
  }, [value]);

  const isCurrentlySaving = isSaving && currentlySavingProduct === productId && currentlySavingField === fieldName;

  const debouncedSave = debounce((newValue: string) => {
    if (!newValue) {
      updateProductField(productId, fieldName, null);
      setIsDirty(false);
      return;
    }
    
    const numValue = Number(newValue);
    if (!isNaN(numValue) && numValue >= 0) {
      if (value !== numValue) {
        updateProductField(productId, fieldName, numValue);
      }
    } else {
      setLocalValue(value !== null ? String(value) : '');
    }
    setIsDirty(false);
  }, 800);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setIsDirty(true);
    debouncedSave(e.target.value);
  };

  if (!isEditMode) return <span>{formatPrice(value, currencyCode)}</span>;

  return (
    <div className="relative">
      <Input
        type="number"
        value={localValue}
        onChange={handleChange}
        className={`h-8 min-w-[100px] ${isDirty ? "border-amber-500" : ""}`}
        min={0}
        step={0.01}
      />
      {isCurrentlySaving && (
        <div className="absolute right-2 top-1">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
