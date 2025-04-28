
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
import { X } from 'lucide-react';

interface ProductSectionFormProps {
  onSave: (sectionData: {
    title: string;
    description: string;
    products: {
      productId: string;
      customPrice?: number;
      customDescription?: string;
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
    }[];
  };
}

export function ProductSectionForm({ onSave, initialData }: ProductSectionFormProps) {
  const [title, setTitle] = useState(initialData?.title || 'Product Showcase');
  const [description, setDescription] = useState(initialData?.description || '');
  const [selectedProducts, setSelectedProducts] = useState<{
    productId: string;
    product?: Product;
    customPrice?: number;
    customDescription?: string;
  }[]>(initialData?.products || []);
  
  const { products, isLoading } = useProducts();
  
  const handleAddProduct = (productId: string, product: Product) => {
    if (!selectedProducts.some(item => item.productId === productId)) {
      setSelectedProducts([...selectedProducts, { productId, product }]);
    }
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
  
  const handleSave = () => {
    onSave({
      title,
      description,
      products: selectedProducts.map(item => ({
        productId: item.productId,
        customPrice: item.customPrice,
        customDescription: item.customDescription
      }))
    });
  };
  
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
        
        <div className="space-y-2">
          <Label>Add Product</Label>
          <ProductSearchSelect
            onChange={handleAddProduct}
            placeholder="Search for products to add"
          />
        </div>
        
        {selectedProducts.length > 0 ? (
          <div className="space-y-3">
            {selectedProducts.map((item) => (
              <Card key={item.productId} className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-2 top-2"
                  onClick={() => handleRemoveProduct(item.productId)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {item.product?.title || "Product"}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
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
