
import React, { useState, KeyboardEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ProgramTag } from "@/types/publishingProgram";
import { ProgramTag as ProgramTagComponent } from "./ProgramTag";
import { Plus, ChevronDown } from "lucide-react";
import { useOrganizationTags, useTagSuggestions } from "@/hooks/usePublishingProgramTags";
import { Badge } from "@/components/ui/badge";

interface EnhancedTagsInputProps {
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

export function EnhancedTagsInput({ tags, onChange, placeholder = "Add a tag..." }: EnhancedTagsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedColor, setSelectedColor] = useState<ProgramTag['color']>('blue');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { tags: organizationTags, createTag, incrementUsage, isLoading } = useOrganizationTags();
  const { data: suggestions = [] } = useTagSuggestions(inputValue);

  // Get popular tags for quick selection
  const popularTags = organizationTags
    .filter(orgTag => !tags.some(tag => tag.name.toLowerCase() === orgTag.name.toLowerCase()))
    .slice(0, 6);

  const addTag = async (tagName: string, tagColor: ProgramTag['color']) => {
    const trimmedName = tagName.trim();
    if (!trimmedName || tags.some(tag => tag.name.toLowerCase() === trimmedName.toLowerCase())) {
      return;
    }

    const newTag: ProgramTag = {
      name: trimmedName,
      color: tagColor
    };

    // Check if this tag exists in the organization's tag library
    const existingOrgTag = organizationTags.find(
      orgTag => orgTag.name.toLowerCase() === trimmedName.toLowerCase() && orgTag.color === tagColor
    );

    try {
      if (existingOrgTag) {
        // Increment usage count for existing tag
        await incrementUsage(existingOrgTag.id);
      } else {
        // Create new tag in the library
        await createTag(newTag);
      }

      // Add to current tags
      onChange([...tags, newTag]);
      setInputValue("");
    } catch (error) {
      console.error("Error managing tag:", error);
      // Still add the tag locally even if saving to library fails
      onChange([...tags, newTag]);
      setInputValue("");
    }
  };

  const addTagFromInput = () => {
    addTag(inputValue, selectedColor);
  };

  const addTagFromSuggestion = (suggestion: any) => {
    addTag(suggestion.name, suggestion.color);
    setShowSuggestions(false);
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTagFromInput();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Show suggestions when input has value
  useEffect(() => {
    setShowSuggestions(inputValue.length > 0);
  }, [inputValue]);

  return (
    <div className="space-y-3">
      {/* Current Tags */}
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

      {/* Popular Tags Quick Selection */}
      {popularTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Popular tags:</p>
          <div className="flex flex-wrap gap-1">
            {popularTags.map((orgTag) => (
              <Button
                key={orgTag.id}
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => addTag(orgTag.name, orgTag.color)}
              >
                <span 
                  className={`w-2 h-2 rounded-full mr-1 ${
                    orgTag.color === 'green' ? 'bg-green-500' :
                    orgTag.color === 'blue' ? 'bg-blue-500' :
                    orgTag.color === 'purple' ? 'bg-purple-500' :
                    orgTag.color === 'orange' ? 'bg-orange-500' :
                    orgTag.color === 'red' ? 'bg-red-500' :
                    orgTag.color === 'yellow' ? 'bg-yellow-500' :
                    orgTag.color === 'pink' ? 'bg-pink-500' :
                    'bg-gray-500'
                  }`}
                />
                {orgTag.name}
                {orgTag.usage_count > 1 && (
                  <Badge variant="secondary" className="ml-1 text-xs h-4 px-1">
                    {orgTag.usage_count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Tag Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => addTagFromSuggestion(suggestion)}
                  >
                    <div className="flex items-center">
                      <span 
                        className={`w-3 h-3 rounded-full mr-2 ${
                          suggestion.color === 'green' ? 'bg-green-500' :
                          suggestion.color === 'blue' ? 'bg-blue-500' :
                          suggestion.color === 'purple' ? 'bg-purple-500' :
                          suggestion.color === 'orange' ? 'bg-orange-500' :
                          suggestion.color === 'red' ? 'bg-red-500' :
                          suggestion.color === 'yellow' ? 'bg-yellow-500' :
                          suggestion.color === 'pink' ? 'bg-pink-500' :
                          'bg-gray-500'
                        }`}
                      />
                      <span className="text-sm">{suggestion.name}</span>
                    </div>
                    {suggestion.usage_count > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.usage_count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <Select value={selectedColor} onValueChange={(value) => setSelectedColor(value as ProgramTag['color'])}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tagColors.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center">
                    <span 
                      className={`w-3 h-3 rounded-full mr-2 ${
                        color.value === 'green' ? 'bg-green-500' :
                        color.value === 'blue' ? 'bg-blue-500' :
                        color.value === 'purple' ? 'bg-purple-500' :
                        color.value === 'orange' ? 'bg-orange-500' :
                        color.value === 'red' ? 'bg-red-500' :
                        color.value === 'yellow' ? 'bg-yellow-500' :
                        color.value === 'pink' ? 'bg-pink-500' :
                        'bg-gray-500'
                      }`}
                    />
                    {color.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addTagFromInput}
            disabled={!inputValue.trim() || isLoading}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
