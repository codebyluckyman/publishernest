
import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/product';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner';
import { ProductWithFormat } from '@/hooks/useProductsWithFormats';
import { adaptProductsToProductWithFormat } from "@/utils/productFormatAdapter";

interface ProductSectionProps {
  products: Product[];
  selectedProducts: { product: ProductWithFormat; customPrice?: number; customDescription?: string; }[];
  setSelectedProducts: (products: { product: ProductWithFormat; customPrice?: number; customDescription?: string; }[]) => void;
  onProductsChange: (products: { product: ProductWithFormat; customPrice?: number; customDescription?: string; }[]) => void;
}

export function ProductSection({ products, selectedProducts, setSelectedProducts, onProductsChange }: ProductSectionProps) {
  const [search, setSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<{ product: ProductWithFormat; customPrice?: number; customDescription?: string; }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProductForCustomization, setSelectedProductForCustomization] = useState<{ product: ProductWithFormat; customPrice?: number; customDescription?: string; } | null>(null);
  const [customPrice, setCustomPrice] = useState<number | undefined>(undefined);
  const [customDescription, setCustomDescription] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    // Initialize filteredProducts with adapted products
    const adaptedProducts = adaptProductsToProductWithFormat(
      products.map(product => ({ product }))
    );
    setFilteredProducts(adaptedProducts);
  }, [products]);

  useEffect(() => {
    // When the dialog is opened, set the custom price and description to the selected product's values
    if (selectedProductForCustomization && isDialogOpen) {
      setCustomPrice(selectedProductForCustomization.customPrice);
      setCustomDescription(selectedProductForCustomization.customDescription);
    }
  }, [selectedProductForCustomization, isDialogOpen]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const filtered = products
      .filter(p => p.title.toLowerCase().includes(e.target.value.toLowerCase()))
      .map(product => ({ product }));
    
    setFilteredProducts(adaptProductsToProductWithFormat(filtered));
  };

  const handleSort = (order: 'asc' | 'desc') => {
    setSortOrder(order);
    if (order === 'asc') {
      const sorted = products
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(product => ({ product }));
      
      setFilteredProducts(adaptProductsToProductWithFormat(sorted));
    } else {
      const sorted = products
        .sort((a, b) => b.title.localeCompare(a.title))
        .map(product => ({ product }));
      
      setFilteredProducts(adaptProductsToProductWithFormat(sorted));
    }
  };

  const handleProductSelect = (product: ProductWithFormat) => {
    const isProductSelected = selectedProducts.some(p => p.product.id === product.id);

    if (isProductSelected) {
      const updatedProducts = selectedProducts.filter(p => p.product.id !== product.id);
      setSelectedProducts(updatedProducts);
      onProductsChange(updatedProducts);
    } else {
      const updatedProducts = [...selectedProducts, { product }];
      setSelectedProducts(updatedProducts);
      onProductsChange(updatedProducts);
    }
  };

  const handleOpenDialog = (product: ProductWithFormat) => {
    const selected = selectedProducts.find(p => p.product.id === product.id);
    setSelectedProductForCustomization(selected || { product });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedProductForCustomization(null);
    setCustomPrice(undefined);
    setCustomDescription(undefined);
  };

  const handleSaveCustomization = () => {
    if (!selectedProductForCustomization) return;

    const updatedProducts = selectedProducts.map(p => {
      if (p.product.id === selectedProductForCustomization.product.id) {
        return {
          ...p,
          customPrice: customPrice,
          customDescription: customDescription,
        };
      }
      return p;
    });

    if (!selectedProducts.some(p => p.product.id === selectedProductForCustomization.product.id)) {
      updatedProducts.push({
        product: selectedProductForCustomization.product,
        customPrice: customPrice,
        customDescription: customDescription,
      });
    }

    setSelectedProducts(updatedProducts);
    onProductsChange(updatedProducts);
    handleCloseDialog();
    toast.success("Product customization saved!");
  };

  const isProductSelected = useCallback((product: ProductWithFormat) => {
    return selectedProducts.some(p => p.product.id === product.id);
  }, [selectedProducts]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={handleSearch}
          className="max-w-md"
        />
        <Select value={sortOrder} onValueChange={handleSort as any}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by Title" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Title (A-Z)</SelectItem>
            <SelectItem value="desc">Title (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map(({ product }) => (
          <div key={product.id} className="border rounded-md p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{product.title}</h3>
                <p className="text-sm text-gray-500">{product.format?.format_name}</p>
                {product.cover_image_url && (
                  <img
                    src={product.cover_image_url}
                    alt={product.title}
                    className="w-24 h-32 object-cover rounded-md"
                  />
                )}
              </div>
              <Checkbox
                id={`product-${product.id}`}
                checked={isProductSelected(product)}
                onCheckedChange={() => handleProductSelect(product)}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => handleOpenDialog(product)}>
                Customize
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedProductForCustomization && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Customize Product</DialogTitle>
              <DialogDescription>
                Make changes to the product details here.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customPrice" className="text-right">
                  Custom Price
                </Label>
                <Input
                  type="number"
                  id="customPrice"
                  value={customPrice !== undefined ? customPrice.toString() : ''}
                  onChange={(e) => setCustomPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="customDescription" className="text-right mt-2">
                  Custom Description
                </Label>
                <Textarea
                  id="customDescription"
                  value={customDescription || ''}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSaveCustomization}>Save</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
