
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";
import { ProductSearchResult } from "./types";

interface ProductSearchProps {
  selectedProductId: string | null;
  selectedProductTitle: string;
  onSelectProduct: (product: ProductSearchResult) => void;
  selectedFormatIds: string[];
}

export function ProductSearch({ 
  selectedProductId, 
  selectedProductTitle,
  onSelectProduct,
  selectedFormatIds
}: ProductSearchProps) {
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Search for products, filtering by selected formats if any are chosen
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query || query.length < 2 || !currentOrganization) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      let queryBuilder = supabase
        .from('products')
        .select('id, title, isbn13')
        .eq('organization_id', currentOrganization.id)
        .ilike('title', `%${query}%`);
      
      // Filter by format_ids if any are selected
      if (selectedFormatIds && selectedFormatIds.length > 0) {
        queryBuilder = queryBuilder.in('format_id', selectedFormatIds);
      }
      
      const { data, error } = await queryBuilder.limit(10);
        
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Failed to search products');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = (product: ProductSearchResult) => {
    onSelectProduct(product);
    setIsSearchOpen(false);
  };

  return (
    <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start"
        >
          <Search className="mr-2 h-4 w-4" />
          {selectedProductId ? selectedProductTitle : "Select a product"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" side="bottom" align="start">
        <Command>
          <CommandInput 
            placeholder={selectedFormatIds.length > 0 
              ? "Search products matching selected formats..." 
              : "Search products..."}
            value={searchQuery}
            onValueChange={handleSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {selectedFormatIds.length > 0 
                    ? "No products found matching the selected formats" 
                    : "No products found"}
                </CommandEmpty>
                <CommandGroup>
                  {searchResults.map((product) => (
                    <CommandItem 
                      key={product.id} 
                      value={product.id}
                      onSelect={() => handleSelectProduct(product)}
                    >
                      <div className="flex flex-col">
                        <span>{product.title}</span>
                        {product.isbn13 && (
                          <span className="text-xs text-muted-foreground">ISBN: {product.isbn13}</span>
                        )}
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
  );
}
