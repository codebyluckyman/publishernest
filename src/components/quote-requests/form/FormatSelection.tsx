
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useFormatsApi } from "@/hooks/useFormatsApi";
import { Organization } from "@/types/organization";
import { useFormContext } from "react-hook-form";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FormatSelectionProps {
  organizationId: string | undefined;
  initialFormatIds: string[];
  quoteRequestId?: string; // Add this prop to explicitly pass the ID
}

export function FormatSelection({ organizationId, initialFormatIds, quoteRequestId }: FormatSelectionProps) {
  const { formats, isLoadingFormats, fetchQuoteRequestFormats } = useFormatsApi({ id: organizationId } as Organization | null);
  const [selectedFormatIds, setSelectedFormatIds] = useState<string[]>(initialFormatIds || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const form = useFormContext();
  
  // For confirmation dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formatToRemove, setFormatToRemove] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize selected formats when component mounts or initialFormatIds changes
  useEffect(() => {
    if (initialFormatIds?.length > 0) {
      setSelectedFormatIds(initialFormatIds);
      form.setValue('format_ids', initialFormatIds);
    }
  }, [initialFormatIds, form]);

  // Update form value when selectedFormatIds changes
  useEffect(() => {
    form.setValue('format_ids', selectedFormatIds);
  }, [selectedFormatIds, form]);

  // Refresh quote request formats when needed
  useEffect(() => {
    const refreshFormats = async () => {
      // Only attempt to fetch if we have a valid quoteRequestId and we're not already refreshing
      if (quoteRequestId && !isRefreshing) {
        try {
          setIsRefreshing(true);
          const formatIds = await fetchQuoteRequestFormats(quoteRequestId);
          // Only update if this is still a valid request (component still mounted and same quoteRequestId)
          setSelectedFormatIds(formatIds);
          form.setValue('format_ids', formatIds);
        } catch (error) {
          console.error("Error refreshing formats:", error);
          // Don't show error toast here as it's likely to be annoying to users
          // Instead, we'll rely on the initial values already set
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    refreshFormats();
    
    // Cleanup function
    return () => {
      // Cleanup logic if needed
    };
  }, [quoteRequestId, refreshTrigger, fetchQuoteRequestFormats, form]);

  const filteredFormats = formats.filter(format => 
    format.format_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFormatSelect = (formatId: string) => {
    const updatedFormatIds = selectedFormatIds.includes(formatId)
      ? selectedFormatIds.filter(id => id !== formatId)
      : [...selectedFormatIds, formatId];
    
    setSelectedFormatIds(updatedFormatIds);
    setSearchQuery("");
  };

  const openRemoveConfirmation = (formatId: string) => {
    setFormatToRemove(formatId);
    setIsDialogOpen(true);
  };

  const handleRemoveFormat = async () => {
    if (!formatToRemove) {
      console.error("no format to remove") 
      return;
    }

    // Get the current quote request id - using the passed prop first, then falling back to the form value
    const currentQuoteRequestId = quoteRequestId || form.getValues('id');
    console.log(`quote request id: ${currentQuoteRequestId}`);
    
    if (!currentQuoteRequestId) {
      console.error("Quote request ID is undefined");
      toast.error("Cannot remove format: Quote request ID is missing");
      setIsDialogOpen(false);
      setFormatToRemove(null);
      return;
    }

    try {
      // Delete the record from the database
      const { error } = await supabase
        .from('quote_request_formats')
        .delete()
        .eq('quote_request_id', currentQuoteRequestId)
        .eq('format_id', formatToRemove);

      if (error) {
        console.error("Error removing format:", error);
        toast.error("Failed to remove format");
      } else {
        toast.success("Format removed successfully");
        // Update local state immediately to show change without waiting for refresh
        const updatedFormatIds = selectedFormatIds.filter(id => id !== formatToRemove);
        setSelectedFormatIds(updatedFormatIds);
        form.setValue('format_ids', updatedFormatIds);
        // Trigger a refresh after successful removal
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error in removeFormat:", error);
      toast.error("Failed to remove format");
    }
    
    // Close dialog and reset
    setIsDialogOpen(false);
    setFormatToRemove(null);
  };

  const getFormatName = (formatId: string): string => {
    const format = formats.find(f => f.id === formatId);
    return format ? format.format_name : 'Unknown Format';
  };

  return (
    <>
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
                        onClick={() => openRemoveConfirmation(formatId)}
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

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remove Format
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this format? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveFormat}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
