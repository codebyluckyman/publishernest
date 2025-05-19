import { useState } from 'react';
import { PresentationSection, PresentationItem, PresentationDisplaySettings } from '@/types/salesPresentation';
import { usePresentationSections } from '@/hooks/usePresentationSections';
import { useSectionItems } from '@/hooks/useSectionItems';
import { useProductsWithFormats, ProductWithFormat } from '@/hooks/useProductsWithFormats';
import { ProductSection } from './ProductSection';
import { AddSectionDialog } from './AddSectionDialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface PresentationSectionsProps {
  presentationId: string;
  isEditable?: boolean;
  displaySettings?: PresentationDisplaySettings;
}

export function PresentationSections({ 
  presentationId, 
  isEditable = false,
  displaySettings 
}: PresentationSectionsProps) {
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  
  const { 
    sections, 
    createSection,
    deleteSection,
    addItem
  } = usePresentationSections(presentationId);
  
  // Changed from useProducts to useProductsWithFormats to get format data
  const { products } = useProductsWithFormats();
  
  const sectionIds = sections.data?.map(section => section.id) || [];
  const { data: sectionItemsMap, isLoading: isLoadingItems } = useSectionItems(sectionIds);
  
  const handleAddSection = async (sectionData: {
    title: string;
    description?: string;
    section_type: 'products' | 'text' | 'media' | 'formats' | 'custom';
    content?: any;
    products?: Array<{
      productId: string;
      customPrice?: number;
      customDescription?: string;
    }>;
  }) => {
    const sectionOrder = sections.data?.length ? sections.data.length : 0;
    
    const sectionId = await createSection.mutateAsync({
      title: sectionData.title,
      description: sectionData.description,
      section_type: sectionData.section_type,
      content: sectionData.content,
      section_order: sectionOrder
    });
    
    if (sectionId && sectionData.products && sectionData.products.length > 0) {
      for (let i = 0; i < sectionData.products.length; i++) {
        const product = sectionData.products[i];
        
        await addItem.mutateAsync({
          sectionId,
          itemData: {
            item_type: 'product',
            item_id: product.productId,
            custom_price: product.customPrice,
            description: product.customDescription,
            display_order: i
          }
        });
      }
    }
  };
  
  const handleDeleteSection = async (sectionId: string) => {
    await deleteSection.mutateAsync(sectionId);
    setSectionToDelete(null);
  };
  
  // Create a map of product IDs to products with format data
  const productMap = new Map<string, ProductWithFormat>();
  if (products) {
    products.forEach(product => {
      productMap.set(product.id, product);
    });
  }
  
  const processedSections = sections.data?.map(section => {
    if (section.section_type === 'products') {
      const sectionItems = sectionItemsMap?.get(section.id) || [];
      
      const productsWithData = sectionItems.map(item => {
        const product = item.item_id ? productMap.get(item.item_id) : undefined;
        
        return {
          product: product as ProductWithFormat,
          customPrice: item.custom_price,
          customDescription: item.description
        };
      }).filter(item => item.product) || [];
      
      return {
        ...section,
        productsWithData
      };
    }
    
    return section;
  });
  
  if (sections.isLoading || isLoadingItems) {
    return <div>Loading sections...</div>;
  }
  
  return (
    <div className="space-y-10">
      {isEditable && (
        <div className="flex justify-end">
          <AddSectionDialog onAddSection={handleAddSection} />
        </div>
      )}
      
      {processedSections && processedSections.length > 0 ? (
        processedSections.map(section => {
          if (section.section_type === 'products' && 'productsWithData' in section) {
            return (
              <div key={section.id} className="relative">
                {isEditable && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0"
                    onClick={() => setSectionToDelete(section.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                
                <ProductSection
                  title={section.title}
                  description={section.description}
                  products={section.productsWithData || []}
                  displaySettings={displaySettings}
                  isEditable={isEditable}
                  onEdit={() => {/* Edit functionality will be added later */}}
                />
              </div>
            );
          }
          
          return null;
        })
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No sections found</h3>
          <p className="text-muted-foreground mt-1">
            {isEditable ? (
              "Add sections to your presentation to showcase your products."
            ) : (
              "This presentation doesn't have any content yet."
            )}
          </p>
          {isEditable && (
            <div className="mt-4">
              <AddSectionDialog onAddSection={handleAddSection} />
            </div>
          )}
        </div>
      )}
      
      <AlertDialog open={!!sectionToDelete} onOpenChange={(open) => !open && setSectionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the section
              and all its contents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => sectionToDelete && handleDeleteSection(sectionToDelete)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
