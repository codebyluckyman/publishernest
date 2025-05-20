
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { useProductEdit } from "@/context/ProductEditContext";
import { debounce } from "lodash";
import { Loader2 } from "lucide-react";

interface EditableTextCellProps {
  value: string;
  productId: string;
  fieldName: string;
}

export function EditableTextCell({ value, productId, fieldName }: EditableTextCellProps) {
  const { isEditMode, updateProductField, isSaving, currentlySavingProduct, currentlySavingField } = useProductEdit();
  const [localValue, setLocalValue] = useState(value || '');
  const [isDirty, setIsDirty] = useState(false);
  
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const isCurrentlySaving = isSaving && currentlySavingProduct === productId && currentlySavingField === fieldName;

  const debouncedSave = debounce((newValue: string) => {
    if (value !== newValue) {
      updateProductField(productId, fieldName, newValue);
    }
    setIsDirty(false);
  }, 800);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setIsDirty(true);
    debouncedSave(e.target.value);
  };

  if (!isEditMode) return <span>{value || ''}</span>;

  return (
    <div className="relative">
      <Input
        value={localValue}
        onChange={handleChange}
        className={`h-8 min-w-[100px] ${isDirty ? "border-amber-500" : ""}`}
      />
      {isCurrentlySaving && (
        <div className="absolute right-2 top-1">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
