
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { PresentationDisplaySettings } from '@/types/salesPresentation';
import { ProductWithFormat } from '@/hooks/useProductsWithFormats';
import { ExtendedProduct } from '@/types/index';
import { ProductCardDisplay } from './ProductCardDisplay';

export interface ProductSectionProps {
  title: string;
  description?: string;
  products?: { 
    product: ProductWithFormat; 
    customPrice?: number; 
    customDescription?: string;
  }[];
  displaySettings?: PresentationDisplaySettings;
  isEditable?: boolean;
  onEdit?: () => void;
}

export default function ProductSection({ 
  title, 
  description, 
  products = [], 
  displaySettings,
  isEditable = false,
  onEdit
}: ProductSectionProps) {
  // Use the displaySettings if provided, otherwise use defaults
  const settings = displaySettings || {
    cardColumns: ['price', 'isbn13', 'publisher'],
    dialogColumns: ['price', 'isbn13', 'publisher', 'publication_date', 'synopsis'],
    defaultView: 'card',
    features: {
      enabledViews: ['card', 'table'],
      allowViewToggle: true,
      showProductDetails: true,
      showPricing: true
    }
  };

  // Get the active view from settings or use the default
  const [activeView, setActiveView] = React.useState(settings.defaultView);
  
  // Function to convert ProductWithFormat to ExtendedProduct
  const convertToExtendedProduct = (item: { 
    product: ProductWithFormat; 
    customPrice?: number; 
    customDescription?: string;
  }): ExtendedProduct => {
    const product = item.product;
    return {
      ...product,
      price: item.customPrice !== undefined ? item.customPrice : product.list_price,
      subtitle: product.subtitle || '',
      synopsis: item.customDescription || product.synopsis || '',
      currency: product.currency_code,
      publisher_name: product.publisher_name || '',
      publication_date: product.publication_date ? new Date(product.publication_date).toISOString() : null,
    };
  };

  // Convert products to ExtendedProduct array
  const extendedProducts: ExtendedProduct[] = products.map(convertToExtendedProduct);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        {isEditable && onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>
      
      <div className="mt-6">
        {activeView === 'card' && (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`}>
            {extendedProducts.map((product, index) => (
              <ProductCardDisplay 
                key={`${product.id}-${index}`}
                product={product}
                displaySettings={settings}
              />
            ))}
          </div>
        )}
        
        {/* Additional views like table, carousel etc. can be added here */}
        
        {extendedProducts.length === 0 && (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">No products in this section</p>
            {isEditable && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={onEdit}
              >
                Add Products
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
