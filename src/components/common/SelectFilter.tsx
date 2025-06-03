
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterOption {
  value: string;
  label: string;
}

interface SelectFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  options: FilterOption[];
  placeholder: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function SelectFilter({
  value,
  onValueChange,
  options,
  placeholder,
  label,
  className,
  disabled = false,
}: SelectFilterProps) {
  // Ensure value is a string to avoid React warnings
  const safeValue = value !== undefined && value !== null ? value : '';
  
  console.log('SelectFilter - value:', value, 'safeValue:', safeValue);
  
  return (
    <div className="flex items-center gap-2">
      {label && (
        <label className="text-sm font-medium mb-1 block">{label}</label>
      )}
      <Select value={safeValue} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={`min-w-[200px] w-full flex-1 ${disabled ? 'opacity-70' : ''}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
