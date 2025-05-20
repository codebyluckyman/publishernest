
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useSectionItems } from '@/hooks/useSectionItems';
import { useToast } from '@/components/ui/use-toast';
import { PresentationSection, PresentationDisplaySettings } from '@/types/salesPresentation';
import { ProductWithFormat } from '@/hooks/useProductsWithFormats';

interface ProductSectionProps {
  section: PresentationSection;
  isEditable: boolean;
  displaySettings: PresentationDisplaySettings;
  isSharedView?: boolean;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  section,
  isEditable,
  displaySettings,
  isSharedView = false
}) => {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const { toast } = useToast();

  // Use the hook with a single section ID
  const { data: itemsMap, isLoading: loading, isError: error } = useSectionItems([section.id]);
  
  // Get items for this section from the map
  const sectionItems = itemsMap?.get(section.id) || [];

  // Convert items to the expected format
  const products = sectionItems.map(item => ({
    product: item.item_type === 'product' && item.custom_content ? 
      item.custom_content as unknown as ProductWithFormat : 
      {} as ProductWithFormat,
    customPrice: item.custom_price,
    customDescription: item.description
  }));

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-32 w-full rounded-md"></div>
        <div className="animate-pulse bg-gray-200 h-32 w-full rounded-md"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-500">Failed to load products. Please try refreshing the page.</p>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6 text-center">
          {isEditable ? (
            <>
              <p className="mb-4">No products added to this section yet.</p>
              <Button onClick={() => setIsAddingProduct(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Products
              </Button>
            </>
          ) : (
            <p>This section doesn't have any products yet.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Placeholder rendering for products
  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((item, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col h-full">
                <h3 className="font-medium mb-2">{item.product.title || 'Product Title'}</h3>
                <p className="text-sm text-gray-500 mb-4">{item.customDescription || item.product.description || 'No description available'}</p>
                <div className="mt-auto flex justify-between items-center">
                  <div className="font-semibold">
                    {item.customPrice ? `${item.customPrice}` : item.product.price ? `${item.product.price}` : 'Price not set'}
                  </div>
                  {isEditable && (
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {isEditable && (
        <div className="flex justify-center mt-6">
          <Button onClick={() => setIsAddingProduct(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add More Products
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductSection;
