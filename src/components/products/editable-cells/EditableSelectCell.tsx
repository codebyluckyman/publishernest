
import React, { useState, useEffect } from 'react';
import { useProductEdit } from "@/context/ProductEditContext";
import { Loader2 } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface Option {
  value: string;
  label: string;
}

interface EditableSelectCellProps {
  value: string | null;
  productId: string;
  fieldName: string;
  options: Option[];
  renderDisplay?: (value: string | null) => React.ReactNode;
}

export function EditableSelectCell({ 
  value, 
  productId, 
  fieldName, 
  options,
  renderDisplay 
}: EditableSelectCellProps) {
  const { isEditMode, updateProductField, isSaving, currentlySavingProduct, currentlySavingField } = useProductEdit();
  const [localValue, setLocalValue] = useState<string | null>(value);
  
  useEffect(() => {
    setLocalValue(value);
    console.log(`EditableSelectCell - Field ${fieldName} value updated:`, value);
  }, [value, fieldName]);

  const isCurrentlySaving = isSaving && currentlySavingProduct === productId && currentlySavingField === fieldName;

  const handleChange = (newValue: string) => {
    // Convert "none" to null
    const valueToSave = newValue === "none" ? null : newValue;
    setLocalValue(valueToSave);
    updateProductField(productId, fieldName, valueToSave);
    console.log(`EditableSelectCell - Field ${fieldName} changed to:`, valueToSave);
  };

  if (!isEditMode) {
    if (renderDisplay) {
      return <>{renderDisplay(value)}</>;
    }
    const option = options.find(opt => opt.value === value);
    return <span>{option ? option.label : 'N/A'}</span>;
  }

  // Ensure we have a safe value for the Select component
  const safeValue = localValue !== null && localValue !== undefined ? localValue : "none";
  
  return (
    <div className="relative">
      <Select
        value={safeValue}
        onValueChange={handleChange}
      >
        <SelectTrigger className="h-8 min-w-[120px]">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isCurrentlySaving && (
        <div className="absolute right-8 top-1">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
