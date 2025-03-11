
import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { useOrganization } from "@/hooks/useOrganization";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { toast } from "sonner";

interface ProductLine {
  id?: string;
  product_id: string;
  product_title: string;
  quantity: number;
  notes: string;
}

// Define a simpler type for search results that matches what we get from the DB query
interface ProductSearchResult {
  id: string;
  title: string;
  isbn13: string | null;
}

export function ProductLinesSection({ quoteRequestId }: { quoteRequestId?: string }) {
  const { currentOrganization } = useOrganization();
  const { setValue, getValues } = useFormContext();
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductTitle, setSelectedProductTitle] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing product lines for this quote request
  useEffect(() => {
    const fetchProductLines = async () => {
      if (!quoteRequestId) return;
      
      try {
        const { data, error } = await supabase
          .from('quote_request_products')
          .select(`
            id, 
            product_id, 
            quantity, 
            notes,
            products:product_id (title)
          `)
          .eq('quote_request_id', quoteRequestId);
          
        if (error) throw error;
        
        if (data) {
          const formattedData = data.map(item => ({
            id: item.id,
            product_id: item.product_id,
            product_title: item.products?.title || 'Unknown Product',
            quantity: item.quantity,
            notes: item.notes || ''
          }));
          
          setProductLines(formattedData);
          setValue('product_lines', formattedData);
        }
      } catch (error) {
        console.error('Error fetching product lines:', error);
        toast.error('Failed to load product lines');
      }
    };
    
    fetchProductLines();
  }, [quoteRequestId, setValue]);

  // Search for products
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query || query.length < 2 || !currentOrganization) {
      setSearchResults([]);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, isbn13')
        .eq('organization_id', currentOrganization.id)
        .ilike('title', `%${query}%`)
        .limit(10);
        
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Failed to search products');
    }
  };

  // Add product line
  const handleAddProductLine = () => {
    if (!selectedProductId || !selectedProductTitle) {
      toast.error('Please select a product');
      return;
    }
    
    // Add to UI state
    const newLine: ProductLine = {
      product_id: selectedProductId,
      product_title: selectedProductTitle,
      quantity: quantity,
      notes: notes
    };
    
    setProductLines([...productLines, newLine]);
    
    // Reset form
    setSelectedProductId(null);
    setSelectedProductTitle("");
    setQuantity(1);
    setNotes("");
    setIsSearchOpen(false);
    
    // Set form value for submission
    setValue('product_lines', [...productLines, newLine]);
  };

  // Remove product line
  const handleRemoveProductLine = (index: number) => {
    const updatedLines = [...productLines];
    updatedLines.splice(index, 1);
    setProductLines(updatedLines);
    setValue('product_lines', updatedLines);
  };

  // Select product from search results
  const handleSelectProduct = (product: ProductSearchResult) => {
    setSelectedProductId(product.id);
    setSelectedProductTitle(product.title);
    setIsSearchOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Lines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
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
                <PopoverContent className="p-0" side="bottom" align="start" alignOffset={0}>
                  <Command>
                    <CommandInput 
                      placeholder="Search products..." 
                      value={searchQuery}
                      onValueChange={handleSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No products found</CommandEmpty>
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
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="w-24">
              <Input
                type="number"
                min="1"
                placeholder="Qty"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="flex-1">
              <Input
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <Button onClick={handleAddProductLine} disabled={!selectedProductId}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          
          {productLines.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="w-[100px]">Quantity</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productLines.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell>{line.product_title}</TableCell>
                    <TableCell>{line.quantity}</TableCell>
                    <TableCell>{line.notes}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveProductLine(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No product lines added yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
