
import React, { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProgramTag } from "@/types/publishingProgram";
import { ProgramTag as ProgramTagComponent } from "./ProgramTag";
import { Plus } from "lucide-react";

interface TagsInputProps {
  tags: ProgramTag[];
  onChange: (tags: ProgramTag[]) => void;
  placeholder?: string;
}

const tagColors = [
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' },
  { value: 'red', label: 'Red' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'pink', label: 'Pink' },
  { value: 'gray', label: 'Gray' },
] as const;

export function TagsInput({ tags, onChange, placeholder = "Add a tag..." }: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedColor, setSelectedColor] = useState<ProgramTag['color']>('blue');

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.some(tag => tag.name.toLowerCase() === trimmedValue.toLowerCase())) {
      const newTag: ProgramTag = {
        name: trimmedValue,
        color: selectedColor
      };
      onChange([...tags, newTag]);
      setInputValue("");
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-3">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <ProgramTagComponent
              key={index}
              tag={tag}
              removable
              onRemove={() => removeTag(index)}
            />
          ))}
        </div>
      )}
      
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        
        <Select value={selectedColor} onValueChange={(value) => setSelectedColor(value as ProgramTag['color'])}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tagColors.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                {color.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addTag}
          disabled={!inputValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
