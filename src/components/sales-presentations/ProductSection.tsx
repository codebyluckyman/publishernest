
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { usePresentationSections } from '@/hooks/usePresentationSections';
import { PresentationItem, PresentationDisplaySettings } from '@/types/salesPresentation';
import { recordItemView } from '@/api/salesPresentations/trackPresentationView';

// We need to define proper types here for the data shapes we're working with
type Product = {
  id: string;
  title: string;
  subtitle?: string;
  isbn13?: string;
  isbn10?: string;
  cover_image_url?: string;
  publisher_name?: string;
  price?: number;
  publication_date?: string;
  synopsis?: string;
  format_id?: string;
  format?: {
    id: string;
    format_name: string;
  };
};

// Extended format fields needed for display
interface FormatLight {
  id: string;
  format_name: string;
  binding_type?: string;
  cover_material?: string;
  cover_stock_print?: string;
  internal_material?: string;
  internal_stock_print?: string;
  orientation?: string;
  extent?: string;
  tps_height_mm?: number;
  tps_width_mm?: number;
  tps_depth_mm?: number;
  tps_plc_height_mm?: number;
  tps_plc_width_mm?: number;
  tps_plc_depth_mm?: number;
}

// Product with a complete format
interface ProductWithFormat extends Omit<Product, 'format'> {
  format?: FormatLight;
}

interface ProductItemProps {
  product: ProductWithFormat;
  customPrice?: number;
  customDescription?: string;
}

interface ProductSectionProps {
  sectionId: string;
  presentationId: string;
  items: PresentationItem[];
  isLoading: boolean;
  isEditable: boolean;
  viewMode: 'card' | 'table' | 'carousel' | 'kanban';
  displaySettings: PresentationDisplaySettings;
  viewId?: string;
  isPublicView?: boolean;
}

// Helper function to extract format details with proper typings
const extractFormatDetails = (format: any): FormatLight => {
  if (!format) return { id: '', format_name: 'No format' };
  
  return {
    id: format.id || '',
    format_name: format.format_name || 'Unknown Format',
    binding_type: format.binding_type,
    cover_material: format.cover_material,
    cover_stock_print: format.cover_stock_print,
    internal_material: format.internal_material,
    internal_stock_print: format.internal_stock_print,
    orientation: format.orientation,
    extent: format.extent,
    tps_height_mm: format.tps_height_mm,
    tps_width_mm: format.tps_width_mm,
    tps_depth_mm: format.tps_depth_mm,
    tps_plc_height_mm: format.tps_plc_height_mm,
    tps_plc_width_mm: format.tps_plc_width_mm,
    tps_plc_depth_mm: format.tps_plc_depth_mm
  };
};

// Helper to prepare product with properly typed format
const prepareProduct = (product: any): ProductWithFormat => {
  return {
    ...product,
    format: product.format ? extractFormatDetails(product.format) : undefined
  };
};

export const ProductSection = ({
  sectionId,
  presentationId,
  items,
  isLoading,
  isEditable,
  viewMode,
  displaySettings,
  viewId,
  isPublicView = false
}: ProductSectionProps) => {
  const { deleteSection } = usePresentationSections(presentationId);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  
  // Function to track item views
  const handleItemView = async (itemId: string) => {
    if (viewId && isPublicView) {
      await recordItemView(presentationId, viewId, itemId);
    }
  };
  
  // Process items to extract product data
  const productItems: { product: ProductWithFormat; customPrice?: number; customDescription?: string }[] = 
    items.filter(item => item.item_type === 'product' && item.custom_content)
      .map(item => ({
        product: prepareProduct(item.custom_content),
        customPrice: item.custom_price,
        customDescription: item.description,
        id: item.id
      }))
      .sort((a, b) => (a.product.title || '').localeCompare(b.product.title || ''));
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="h-64 animate-pulse">
            <CardContent className="p-0 h-full flex items-center justify-center">
              <div className="w-full h-full bg-muted"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // Render empty state for editable sections
  if (items.length === 0 && isEditable) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No products added to this section yet</p>
          <Button onClick={() => setIsProductDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Products
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Render empty state for non-editable sections
  if (items.length === 0 && !isEditable) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No products in this section</p>
        </CardContent>
      </Card>
    );
  }
  
  // Render appropriate view based on viewMode
  switch (viewMode) {
    case 'card':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productItems.map(({ product, customPrice, customDescription, id }) => (
            <Card 
              key={product.id} 
              className="overflow-hidden"
              onClick={() => handleItemView(id as string)}
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                {product.cover_image_url ? (
                  <img 
                    src={product.cover_image_url} 
                    alt={product.title} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="bg-muted h-full w-full flex items-center justify-center">
                    <span className="text-muted-foreground">No cover image</span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold truncate">{product.title}</h3>
                {product.subtitle && (
                  <p className="text-sm text-muted-foreground truncate">{product.subtitle}</p>
                )}
                <div className="mt-2 space-y-1">
                  {displaySettings.cardColumns?.includes('price') && (
                    <p className="text-sm">
                      <span className="font-medium">Price:</span> ${customPrice || product.price || 'N/A'}
                    </p>
                  )}
                  {displaySettings.cardColumns?.includes('isbn13') && product.isbn13 && (
                    <p className="text-sm">
                      <span className="font-medium">ISBN-13:</span> {product.isbn13}
                    </p>
                  )}
                  {displaySettings.cardColumns?.includes('publisher') && product.publisher_name && (
                    <p className="text-sm">
                      <span className="font-medium">Publisher:</span> {product.publisher_name}
                    </p>
                  )}
                  {displaySettings.cardColumns?.includes('publication_date') && product.publication_date && (
                    <p className="text-sm">
                      <span className="font-medium">Publication Date:</span> {product.publication_date}
                    </p>
                  )}
                  {customDescription && (
                    <p className="text-sm mt-2">{customDescription}</p>
                  )}
                </div>
              </CardContent>
              {isEditable && (
                <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
          {isEditable && (
            <Card className="border-dashed flex items-center justify-center min-h-[300px]">
              <CardContent className="text-center p-6">
                <Button onClick={() => setIsProductDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Products
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      );
      
    case 'table':
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-2 text-left">Title</th>
                {displaySettings.cardColumns?.includes('publisher') && (
                  <th className="px-4 py-2 text-left">Publisher</th>
                )}
                {displaySettings.cardColumns?.includes('isbn13') && (
                  <th className="px-4 py-2 text-left">ISBN-13</th>
                )}
                {displaySettings.cardColumns?.includes('price') && (
                  <th className="px-4 py-2 text-right">Price</th>
                )}
                {displaySettings.cardColumns?.includes('publication_date') && (
                  <th className="px-4 py-2 text-left">Publication Date</th>
                )}
                {isEditable && <th className="px-4 py-2"></th>}
              </tr>
            </thead>
            <tbody>
              {productItems.map(({ product, customPrice, id }) => (
                <tr 
                  key={product.id} 
                  className="border-b hover:bg-muted/50"
                  onClick={() => handleItemView(id as string)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.cover_image_url && (
                        <img 
                          src={product.cover_image_url} 
                          alt="" 
                          className="h-12 w-9 object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{product.title}</p>
                        {product.subtitle && (
                          <p className="text-sm text-muted-foreground">{product.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  {displaySettings.cardColumns?.includes('publisher') && (
                    <td className="px-4 py-3">{product.publisher_name || 'N/A'}</td>
                  )}
                  {displaySettings.cardColumns?.includes('isbn13') && (
                    <td className="px-4 py-3">{product.isbn13 || 'N/A'}</td>
                  )}
                  {displaySettings.cardColumns?.includes('price') && (
                    <td className="px-4 py-3 text-right">${customPrice || product.price || 'N/A'}</td>
                  )}
                  {displaySettings.cardColumns?.includes('publication_date') && (
                    <td className="px-4 py-3">{product.publication_date || 'N/A'}</td>
                  )}
                  {isEditable && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          
          {isEditable && (
            <div className="mt-4 flex justify-center">
              <Button onClick={() => setIsProductDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Products
              </Button>
            </div>
          )}
        </div>
      );
      
    // For simplicity, we're not implementing the carousel and kanban views yet
    case 'carousel':
    case 'kanban':
    default:
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">{viewMode} view coming soon</p>
            <Button onClick={() => setIsProductDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Products
            </Button>
          </CardContent>
        </Card>
      );
  }
};
