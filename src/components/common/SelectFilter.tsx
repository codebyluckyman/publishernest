
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
}

export function SelectFilter({
  value,
  onValueChange,
  options,
  placeholder,
  label,
  className,
}: SelectFilterProps) {
  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-medium mb-1 block">{label}</label>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
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
