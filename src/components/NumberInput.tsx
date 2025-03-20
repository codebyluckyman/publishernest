
import React from "react";
import { Input } from "@/components/ui/input";

interface NumberInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  placeholder?: string;
}

export function NumberInput({
  id,
  value,
  onChange,
  min,
  max,
  step = 1,
  className,
  placeholder
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
    
    if (isNaN(newValue)) return;
    
    // Check against min/max constraints
    if (min !== undefined && newValue < min) {
      onChange(min);
      return;
    }
    
    if (max !== undefined && newValue > max) {
      onChange(max);
      return;
    }
    
    onChange(newValue);
  };

  return (
    <Input
      id={id}
      type="number"
      value={value.toString()}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      className={className}
      placeholder={placeholder}
    />
  );
}
