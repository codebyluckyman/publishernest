import { useState } from 'react';
import { PresentationSection, PresentationItem } from '@/types/salesPresentation';
import { usePresentationSections } from '@/hooks/usePresentationSections';
import { Product } from '@/types/product';
import { useProducts } from '@/hooks/useProducts';
import { ProductSection } from './ProductSection';
import { AddSectionDialog } from './AddSectionDialog';
import { EditProductSectionDialog } from './EditProductSectionDialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2, GripVertical } from 'lucide-react';

interface PresentationSectionsProps {
  presentationId: string;
  isEditable?: boolean;
}

export function PresentationSections({ presentationId, isEditable = false }: PresentationSectionsProps) {
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  const [sectionToEdit, setSectionToEdit] = useState<{
    section: PresentationSection;
    productsWithData: Array<{
      product: Product;
      customPrice?: number;
      customDescription?: string;
    }>;
  } | null>(null);
  
  const { 
    sections, 
    getSectionItems,
    createSection,
    deleteSection,
    addItem,
    updateSection,
    updateItem,
    deleteItem
  } = usePresentationSections(presentationId);
  
  const { products } = useProducts();
  
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
    // Calculate new section order
    const sectionOrder = sections.data?.length ? sections.data.length : 0;
    
    // Create section
    const sectionId = await createSection.mutateAsync({
      title: sectionData.title,
      description: sectionData.description,
      section_type: sectionData.section_type,
      content: sectionData.content,
      section_order: sectionOrder
    });
    
    // If products were provided and section creation was successful
    if (sectionId && sectionData.products && sectionData.products.length > 0) {
      // Add product items to section
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
  
  const handleEditSection = async (section: PresentationSection, editData: {
    title: string;
    description: string;
    products: Array<{
      productId: string;
      customPrice?: number;
      customDescription?: string;
    }>;
  }) => {
    try {
      // Update section details
      await updateSection.mutateAsync({
        sectionId: section.id,
        sectionData: {
          title: editData.title,
          description: editData.description
        }
      });
      
      // Get current items
      const { data: currentItems } = getSectionItems(section.id);
      
      // Delete all current items
      if (currentItems) {
        for (const item of currentItems) {
          await deleteItem.mutateAsync({
            itemId: item.id,
            sectionId: section.id
          });
        }
      }
      
      // Add new items
      for (let i = 0; i < editData.products.length; i++) {
        const product = editData.products[i];
        await addItem.mutateAsync({
          sectionId: section.id,
          itemData: {
            item_type: 'product',
            item_id: product.productId,
            custom_price: product.customPrice,
            description: product.customDescription,
            display_order: i
          }
        });
      }
      
      setSectionToEdit(null);
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };
  
  const handleDeleteSection = async (sectionId: string) => {
    await deleteSection.mutateAsync(sectionId);
    setSectionToDelete(null);
  };
  
  // Map products to their IDs for easier lookup
  const productMap = new Map<string, Product>();
  if (products) {
    products.forEach(product => {
      productMap.set(product.id, product);
    });
  }
  
  // Process sections to include product data
  const processedSections = sections.data?.map(section => {
    if (section.section_type === 'products') {
      const { data: sectionItems } = getSectionItems(section.id);
      
      const productsWithData = sectionItems?.map(item => {
        const product = item.item_id ? productMap.get(item.item_id) : undefined;
        
        return {
          product: product as Product,
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

  if (sections.isLoading) {
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
        <div className="space-y-10">
          {processedSections.map(section => {
            if (section.section_type === 'products' && 'productsWithData' in section) {
              return (
                <div key={section.id} className="relative group">
                  {isEditable && (
                    <div className="absolute right-0 top-0 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="cursor-grab"
                      >
                        <GripVertical className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSectionToDelete(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <ProductSection
                    title={section.title}
                    description={section.description}
                    products={section.productsWithData || []}
                    isEditable={isEditable}
                    onEdit={() => setSectionToEdit({
                      section,
                      productsWithData: section.productsWithData || []
                    })}
                  />
                </div>
              );
            }
            
            return null;
          })}
        </div>
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

      {sectionToEdit && (
        <EditProductSectionDialog
          open={true}
          onOpenChange={(open) => !open && setSectionToEdit(null)}
          initialData={{
            title: sectionToEdit.section.title,
            description: sectionToEdit.section.description || '',
            products: sectionToEdit.productsWithData.map(item => ({
              productId: item.product.id,
              product: item.product,
              customPrice: item.customPrice,
              customDescription: item.customDescription
            }))
          }}
          onSave={(data) => handleEditSection(sectionToEdit.section, data)}
        />
      )}
    </div>
  );
}
