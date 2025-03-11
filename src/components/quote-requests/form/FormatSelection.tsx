
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useFormatsApi } from "@/hooks/useFormatsApi";
import { Organization } from "@/types/organization";
import { useFormContext } from "react-hook-form";

interface FormatSelectionProps {
  organizationId: string | undefined;
  initialFormatIds: string[];
}

export function FormatSelection({ organizationId, initialFormatIds }: FormatSelectionProps) {
  const { formats, isLoadingFormats } = useFormatsApi({ id: organizationId } as Organization | null);
  const [selectedFormatIds, setSelectedFormatIds] = useState<string[]>(initialFormatIds);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const form = useFormContext();

  // Update selectedFormatIds when initialFormatIds changes
  useEffect(() => {
    setSelectedFormatIds(initialFormatIds);
    form.setValue('format_ids', initialFormatIds);
  }, [initialFormatIds, form]);

  // Sync local state with form state
  useEffect(() => {
    const formFormatIds = form.getValues('format_ids') || [];
    if (JSON.stringify(formFormatIds) !== JSON.stringify(selectedFormatIds)) {
      setSelectedFormatIds(formFormatIds);
    }
  }, [form.getValues('format_ids'), form]);

  const filteredFormats = formats.filter(format => 
    format.format_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFormatSelect = (formatId: string) => {
    const updatedFormatIds = selectedFormatIds.includes(formatId)
      ? selectedFormatIds.filter(id => id !== formatId)
      : [...selectedFormatIds, formatId];
    
    setSelectedFormatIds(updatedFormatIds);
    form.setValue('format_ids', updatedFormatIds);
    setSearchQuery("");
  };

  const removeFormat = (formatId: string) => {
    const updatedFormatIds = selectedFormatIds.filter(id => id !== formatId);
    setSelectedFormatIds(updatedFormatIds);
    form.setValue('format_ids', updatedFormatIds);
  };

  const getFormatName = (formatId: string): string => {
    const format = formats.find(f => f.id === formatId);
    return format ? format.format_name : 'Unknown Format';
  };

  return (
    <FormField
      control={form.control}
      name="format_ids"
      render={() => (
        <FormItem>
          <FormLabel>Formats</FormLabel>
          <div className="space-y-4">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search and select formats
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" side="bottom" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search formats..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    {isLoadingFormats ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No formats found</CommandEmpty>
                        <CommandGroup>
                          {filteredFormats.map((format) => (
                            <CommandItem 
                              key={format.id} 
                              value={format.format_name}
                              onSelect={() => handleFormatSelect(format.id)}
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox 
                                  checked={selectedFormatIds.includes(format.id)}
                                />
                                <span>{format.format_name}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {selectedFormatIds.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-4 border rounded-md">
                {selectedFormatIds.map((formatId) => (
                  <Badge key={formatId} variant="secondary" className="flex items-center gap-1">
                    {getFormatName(formatId)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() => removeFormat(formatId)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="p-4 border rounded-md text-center text-muted-foreground">
                No formats selected
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
