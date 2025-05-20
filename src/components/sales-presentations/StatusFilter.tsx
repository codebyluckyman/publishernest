
import * as React from "react";
import { SelectFilter, FilterOption } from "@/components/common/SelectFilter";

interface StatusFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function StatusFilter({ 
  value, 
  onValueChange, 
  className,
  disabled = false
}: StatusFilterProps) {
  const options: FilterOption[] = [
    { value: "all", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" }
  ];

  return (
    <SelectFilter
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder="Filter by status"
      label="Status"
      className={className}
      disabled={disabled}
    />
  );
}
