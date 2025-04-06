
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUnitOfMeasures } from "@/hooks/useUnitOfMeasures";
import { Combobox } from "@/components/ui/combobox";

interface UnitOfMeasureSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  useCombobox?: boolean;
  disabled?: boolean;
  organizationId?: string; // Add organizationId prop
}

export function UnitOfMeasureSelect({ 
  value, 
  onChange, 
  placeholder = "Select unit...", 
  className,
  useCombobox = false,
  disabled = false,
  organizationId // Add organizationId to component props
}: UnitOfMeasureSelectProps) {
  const { unitOptions, isLoading } = useUnitOfMeasures(organizationId); // Pass organizationId to the hook

  if (useCombobox) {
    return (
      <Combobox
        items={unitOptions}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        searchPlaceholder="Search units..."
        emptyMessage="No unit of measure found"
        className={className}
        disabled={disabled || isLoading}
        isLoading={isLoading}
      />
    );
  }

  return (
    <Select
      value={value || ""}
      onValueChange={onChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {unitOptions.map((unit) => (
          <SelectItem key={unit.value} value={unit.value}>
            {unit.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
