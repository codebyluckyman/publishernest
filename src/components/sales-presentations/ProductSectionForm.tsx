
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProducts } from '@/hooks/useProducts';
import { ProductSearchSelect } from '@/components/common/ProductSearchSelect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Star } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductSectionFormProps {
  onSave: (sectionData: {
    title: string;
    description: string;
    products: {
      productId: string;
      customPrice?: number;
      customDescription?: string;
      isHighlighted?: boolean;
      badge?: string;
    }[];
  }) => void;
  initialData?: {
    title: string;
    description: string;
    products: {
      productId: string;
      product?: Product;
      customPrice?: number;
      customDescription?: string;
      isHighlighted?: boolean;
      badge?: string;
    }[];
  };
}

const BADGE_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'featured', label: 'Featured' },
  { value: 'bestseller', label: 'Best Seller' },
  { value: 'limited', label: 'Limited Edition' }
];

export function ProductSectionForm({ onSave, initialData }: ProductSectionFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [selectedProducts, setSelectedProducts] = useState<{
    productId: string;
    product?: Product;
    customPrice?: number;
    customDescription?: string;
    isHighlighted?: boolean;
    badge?: string;
  }[]>(initialData?.products || []);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  const { products, isLoading } = useProducts();
  
  const handleAddProduct = (productId: string, product: Product) => {
    if (!selectedProducts.some(item => item.productId === productId)) {
      setSelectedProducts([...selectedProducts, { 
        productId, 
        product,
        isHighlighted: false 
      }]);
    }
  };
  
  const handleBulkAddProducts = () => {
    const productsToAdd = products?.filter(
      product => selectedProductIds.includes(product.id) && 
      !selectedProducts.some(item => item.productId === product.id)
    ) || [];

    setSelectedProducts([
      ...selectedProducts,
      ...productsToAdd.map(product => ({
        productId: product.id,
        product,
        isHighlighted: false
      }))
    ]);
    setSelectedProductIds([]);
  };
  
  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(item => item.productId !== productId));
  };
  
  const handleUpdateCustomPrice = (productId: string, price: number) => {
    setSelectedProducts(selectedProducts.map(item => 
      item.productId === productId ? { ...item, customPrice: price } : item
    ));
  };
  
  const handleUpdateCustomDescription = (productId: string, description: string) => {
    setSelectedProducts(selectedProducts.map(item => 
      item.productId === productId ? { ...item, customDescription: description } : item
    ));
  };

  const handleToggleHighlight = (productId: string) => {
    setSelectedProducts(selectedProducts.map(item => 
      item.productId === productId ? { ...item, isHighlighted: !item.isHighlighted } : item
    ));
  };

  const handleUpdateBadge = (productId: string, badge: string) => {
    setSelectedProducts(selectedProducts.map(item => 
      item.productId === productId ? { ...item, badge } : item
    ));
  };
  
  const handleSave = () => {
    onSave({
      title,
      description,
      products: selectedProducts.map(item => ({
        productId: item.productId,
        customPrice: item.customPrice,
        customDescription: item.customDescription,
        isHighlighted: item.isHighlighted,
        badge: item.badge
      }))
    });
  };

  const availableProducts = products?.filter(
    product => !selectedProducts.some(item => item.productId === product.id)
  ) || [];
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Section Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter section title"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Section Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter section description"
          rows={3}
        />
      </div>
      
      <div className="border-t pt-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Products</h3>
          <Badge variant="outline">{selectedProducts.length} selected</Badge>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Bulk Add Products</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <ProductSearchSelect
                  onChange={(productId, product) => {
                    setSelectedProductIds(prev => 
                      prev.includes(productId) 
                        ? prev.filter(id => id !== productId)
                        : [...prev, productId]
                    );
                  }}
                  placeholder="Select multiple products to add"
                  selectedProductIds={selectedProductIds}
                  multiple
                />
              </div>
              <Button 
                onClick={handleBulkAddProducts}
                disabled={selectedProductIds.length === 0}
              >
                Add Selected
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quick Add Product</Label>
            <ProductSearchSelect
              onChange={handleAddProduct}
              placeholder="Search for products to add"
            />
          </div>
        </div>
        
        {selectedProducts.length > 0 ? (
          <div className="space-y-3">
            {selectedProducts.map((item) => (
              <Card key={item.productId} className={`relative transition-all ${item.isHighlighted ? 'ring-2 ring-primary' : ''}`}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-2 top-2"
                  onClick={() => handleRemoveProduct(item.productId)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {item.product?.title || "Product"}
                      {item.badge && (
                        <Badge className="ml-2" variant="secondary">
                          {item.badge}
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`highlight-${item.productId}`}
                        checked={item.isHighlighted}
                        onCheckedChange={() => handleToggleHighlight(item.productId)}
                      />
                      <Label htmlFor={`highlight-${item.productId}`} className="text-sm">
                        Highlight Product
                      </Label>
                    </div>
                    
                    <div className="flex-1">
                      <Select
                        value={item.badge}
                        onValueChange={(value) => handleUpdateBadge(item.productId, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add badge" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Badge</SelectItem>
                          {BADGE_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`custom-price-${item.productId}`}>Custom Price (Optional)</Label>
                    <Input
                      id={`custom-price-${item.productId}`}
                      type="number"
                      value={item.customPrice || ''}
                      onChange={(e) => handleUpdateCustomPrice(item.productId, Number(e.target.value))}
                      placeholder={`Default: ${item.product?.list_price || 'N/A'}`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`custom-desc-${item.productId}`}>Custom Description (Optional)</Label>
                    <Textarea
                      id={`custom-desc-${item.productId}`}
                      value={item.customDescription || ''}
                      onChange={(e) => handleUpdateCustomDescription(item.productId, e.target.value)}
                      placeholder="Add custom description for this product"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground">
            No products selected. Add products using the search above.
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Section
        </Button>
      </div>
    </div>
  );
}
