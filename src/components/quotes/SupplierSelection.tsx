
import { useEffect, useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Supplier } from "@/types/supplier";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { QuoteFormValues } from "./quoteFormSchema";

interface SupplierSelectionProps {
  form: UseFormReturn<QuoteFormValues>;
  currentOrganization: Organization | null;
  onSupplierSelect: (supplier: Supplier | null) => void;
}

export function SupplierSelection({ form, currentOrganization, onSupplierSelect }: SupplierSelectionProps) {
  const [open, setOpen] = useState(false);
  const [createNew, setCreateNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const supplierId = form.watch("supplier_id");
  
  // Fetch suppliers list
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers', currentOrganization?.id, searchQuery],
    queryFn: async () => {
      if (!currentOrganization) return [];
      
      try {
        let query = supabase
          .from('suppliers')
          .select('id, supplier_name, contact_email, contact_phone, status')
          .eq('organization_id', currentOrganization.id)
          .eq('status', 'active');
          
        if (searchQuery) {
          query = query.ilike('supplier_name', `%${searchQuery}%`);
        }
        
        const { data, error } = await query.order('supplier_name');
        
        if (error) {
          console.error('Error fetching suppliers:', error);
          return [];
        }
        
        return data as Supplier[];
      } catch (error) {
        console.error('Error in SupplierSelection query:', error);
        return [];
      }
    },
    enabled: !!currentOrganization,
  });

  // Find the selected supplier
  const selectedSupplier = suppliers.find(s => s.id === supplierId);

  // Effect to update contact fields when supplier changes
  useEffect(() => {
    if (selectedSupplier) {
      form.setValue("contact_email", selectedSupplier.contact_email || "");
      form.setValue("contact_phone", selectedSupplier.contact_phone || "");
      onSupplierSelect(selectedSupplier);
    } else if (supplierId === null) {
      onSupplierSelect(null);
    }
  }, [selectedSupplier, supplierId, form, onSupplierSelect]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="supplier_id"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Supplier</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value && selectedSupplier
                      ? selectedSupplier.supplier_name
                      : createNew
                      ? "Create New Supplier"
                      : "Select supplier..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Search suppliers..." 
                    onValueChange={(value) => setSearchQuery(value)}
                  />
                  <CommandList>
                    <CommandEmpty>
                      No suppliers found.
                      <Button
                        variant="ghost"
                        className="mt-2 w-full justify-start"
                        onClick={() => {
                          setCreateNew(true);
                          setOpen(false);
                          field.onChange(null);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create new supplier
                      </Button>
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          field.onChange(null);
                          setCreateNew(true);
                          setOpen(false);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create new supplier
                      </CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Existing suppliers">
                      {suppliers.map((supplier) => (
                        <CommandItem
                          key={supplier.id}
                          onSelect={() => {
                            field.onChange(supplier.id);
                            setCreateNew(false);
                            setOpen(false);
                          }}
                          className="flex items-center justify-between"
                        >
                          <span>{supplier.supplier_name}</span>
                          {field.value === supplier.id && <Check className="h-4 w-4" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {(createNew || !supplierId) && (
        <FormField
          control={form.control}
          name="supplier_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{createNew ? "New Supplier Name" : "Supplier Name"} <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
