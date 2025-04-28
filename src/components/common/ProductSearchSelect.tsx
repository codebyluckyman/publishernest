
import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/product';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface ProductSearchSelectProps {
  value?: string;
  onChange: (value: string, product: Product) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  multiple?: boolean;
  selectedProductIds?: string[];
}

export function ProductSearchSelect({
  value,
  onChange,
  disabled = false,
  placeholder = "Select a product",
  className,
  multiple = false,
  selectedProductIds = []
}: ProductSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { products, isLoading } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Find the currently selected product
  const selectedProduct = value ? products?.find(product => product.id === value) : undefined;

  // Filter products based on search term
  useEffect(() => {
    if (!products) return;
    
    const filtered = products.filter(product => {
      const searchLower = searchTerm.toLowerCase();
      return (
        product.title.toLowerCase().includes(searchLower) || 
        (product.isbn13 && product.isbn13.toLowerCase().includes(searchLower))
      );
    });
    
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">
            {selectedProduct ? selectedProduct.title : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput 
            placeholder="Search by title or ISBN-13..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          {isLoading ? (
            <div className="py-6 text-center text-sm">Loading products...</div>
          ) : (
            <>
              <CommandList>
                <CommandEmpty>No products found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-y-auto">
                  {filteredProducts.map((product) => {
                    const isSelected = multiple 
                      ? selectedProductIds.includes(product.id) 
                      : value === product.id;
                      
                    return (
                      <CommandItem
                        key={product.id}
                        value={`${product.title} ${product.isbn13 || ''}`}
                        onSelect={() => {
                          onChange(product.id, product);
                          if (!multiple) {
                            setOpen(false);
                          }
                        }}
                      >
                        <div className="flex flex-col text-left">
                          <div className="flex items-center">
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="font-medium">{product.title}</span>
                          </div>
                          {product.isbn13 && (
                            <span className="text-xs text-gray-500 pl-6">ISBN: {product.isbn13}</span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>  
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
