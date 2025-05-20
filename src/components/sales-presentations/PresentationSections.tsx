
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { usePresentationSections } from '@/hooks/usePresentationSections';
import { useSectionItems } from '@/hooks/useSectionItems';
import { Product } from '@/types/product';
import { ProductSection } from './ProductSection';
import { PresentationSection, PresentationItem, PresentationDisplaySettings, PresentationViewMode } from '@/types/salesPresentation';
import { toast } from 'sonner';
import { ProductWithFormat } from '@/hooks/useProductsWithFormats';
import { adaptProductsToProductWithFormat } from "@/utils/productFormatAdapter";
import { ViewToggle } from './ViewToggle';
import { CarouselView } from './CarouselView';
import { KanbanView } from './KanbanView';

interface PresentationSectionsProps {
  presentationId: string | undefined;
  products?: Product[];
  isEditable?: boolean;
  displaySettings?: PresentationDisplaySettings;
}

const PresentationSections: React.FC<PresentationSectionsProps> = ({ 
  presentationId, 
  products = [], 
  isEditable = false,
  displaySettings 
}) => {
  const {
    sections,
    getSectionItems,
    createSection,
    updateSection,
    deleteSection,
    addItem,
    updateItem,
    deleteItem
  } = usePresentationSections(presentationId);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sectionType, setSectionType] = useState('products');
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<{ product: ProductWithFormat; customPrice?: number; customDescription?: string; }[]>([]);
  const [sectionOrder, setSectionOrder] = useState(1);
  const [editSectionId, setEditSectionId] = useState<string | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');
  const [editSectionDescription, setEditSectionDescription] = useState('');
  const [editSectionOrder, setEditSectionOrder] = useState(1);
  const [sectionsData, setSectionsData] = useState<PresentationSection[]>([]);
  
  // Add state for view mode
  const [viewMode, setViewMode] = useState<PresentationViewMode>(
    displaySettings?.defaultView || 'card'
  );

  // Add state for selected product for dialog view
  const [selectedProduct, setSelectedProduct] = useState<{
    product: ProductWithFormat;
    customPrice?: number;
    customDescription?: string;
  } | null>(null);
  
  // Load sections on component mount
  useEffect(() => {
    if (sections.data) {
      setSectionsData(sections.data);
    }
  }, [sections.data]);

  // Get all section IDs to fetch items
  const sectionIds = sectionsData.map(section => section.id);
  
  // Fetch items for all sections
  const { data: itemsMap, isLoading: itemsLoading } = useSectionItems(sectionIds);
  
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSectionType('products');
    setSectionTitle('');
    setSectionDescription('');
    setSelectedProducts([]);
    setSectionOrder(1);
    setEditSectionId(null);
    setEditSectionTitle('');
    setEditSectionDescription('');
    setEditSectionOrder(1);
  };
  
  const handleSectionTypeChange = (value: string) => {
    setSectionType(value);
  };
  
  const handleSectionTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSectionTitle(e.target.value);
  };
  
  const handleSectionDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSectionDescription(e.target.value);
  };
  
  const handleSectionOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSectionOrder(parseInt(e.target.value));
  };
  
  const handleCreateSection = async () => {
    if (!sectionTitle) {
      toast.error('Please enter a section title');
      return;
    }
    
    try {
      const sectionData = {
        title: sectionTitle,
        description: sectionDescription,
        section_type: sectionType,
        section_order: sectionOrder,
      };
      
      await createSection.mutateAsync(sectionData);
      
      // After creating the section, add the selected products as items
      if (sectionType === 'products' && selectedProducts.length > 0) {
        // Fetch the newly created section to get its ID
        const newSection = sections.data?.find(section => section.title === sectionTitle);
        
        if (newSection) {
          // Add each selected product as an item in the new section
          for (const selectedProduct of selectedProducts) {
            const itemData = {
              item_type: 'product',
              item_id: selectedProduct.product.id,
              title: selectedProduct.product.title,
              description: selectedProduct.customDescription,
              custom_price: selectedProduct.customPrice,
              display_order: 1, // You might want to allow users to set the display order
            };
            
            await addItem.mutateAsync({ sectionId: newSection.id, itemData });
          }
        }
      }
      
      handleCloseDialog();
      toast.success('Section created successfully');
    } catch (error) {
      console.error('Error creating section:', error);
      toast.error('Failed to create section');
    }
  };
  
  const handleEditSection = (section: PresentationSection) => {
    setEditSectionId(section.id);
    setEditSectionTitle(section.title);
    setEditSectionDescription(section.description || '');
    setEditSectionOrder(section.section_order || 1);
    handleOpenDialog();
  };
  
  const handleEditSectionTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditSectionTitle(e.target.value);
  };
  
  const handleEditSectionDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditSectionDescription(e.target.value);
  };
  
  const handleEditSectionOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditSectionOrder(parseInt(e.target.value));
  };
  
  const handleUpdateSection = async () => {
    if (!editSectionId) return;
    
    try {
      const sectionData = {
        title: editSectionTitle,
        description: editSectionDescription,
        section_order: editSectionOrder,
      };
      
      await updateSection.mutateAsync({ sectionId: editSectionId, sectionData });
      handleCloseDialog();
      toast.success('Section updated successfully');
    } catch (error) {
      console.error('Error updating section:', error);
      toast.error('Failed to update section');
    }
  };
  
  const handleDeleteSection = async (sectionId: string) => {
    try {
      await deleteSection.mutateAsync(sectionId);
      toast.success('Section deleted successfully');
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Failed to delete section');
    }
  };
  
  const handleProductsChange = (products: { product: ProductWithFormat; customPrice?: number; customDescription?: string; }[]) => {
    setSelectedProducts(products);
  };

  const handleSelectProduct = (product: {
    product: ProductWithFormat;
    customPrice?: number;
    customDescription?: string;
  }) => {
    setSelectedProduct(product);
    // Here you could open a dialog to show product details
    console.log('Selected product:', product);
  };

  // Function to render section items based on view mode
  const renderSectionItems = (section: PresentationSection) => {
    if (!itemsMap || !itemsMap.get(section.id)) {
      return <div>No items in this section</div>;
    }

    const items = itemsMap.get(section.id) || [];
    
    // Convert items to product format needed by view components
    const products = items
      .filter(item => item.item_type === 'product')
      .map(item => {
        // Find the corresponding product from the products prop
        const product = products.find(p => p.id === item.item_id);
        if (!product) {
          return null;
        }
        
        return {
          product: adaptProductsToProductWithFormat([product])[0].product,
          customPrice: item.custom_price,
          customDescription: item.description,
        };
      })
      .filter(Boolean); // Remove nulls
    
    if (products.length === 0) {
      return <div className="text-muted-foreground py-4 text-center">No products in this section</div>;
    }

    switch (viewMode) {
      case 'card':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
            {products.map((item) => (
              <Card 
                key={item.product.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectProduct(item)}
              >
                {item.product.cover_image_url && (
                  <div className="aspect-[3/4] w-full overflow-hidden">
                    <img
                      src={item.product.cover_image_url}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-medium line-clamp-2">{item.product.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.product.isbn13 || 'No ISBN'}
                  </p>
                  {item.customPrice !== undefined ? (
                    <p className="text-sm font-medium mt-1">${item.customPrice.toFixed(2)}</p>
                  ) : item.product.list_price ? (
                    <p className="text-sm font-medium mt-1">${item.product.list_price.toFixed(2)}</p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        );
      
      case 'table':
        return (
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Cover</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((item) => (
                  <TableRow 
                    key={item.product.id}
                    className="cursor-pointer"
                    onClick={() => handleSelectProduct(item)}
                  >
                    <TableCell>
                      {item.product.cover_image_url ? (
                        <div className="w-12 h-16 overflow-hidden">
                          <img
                            src={item.product.cover_image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-16 bg-gray-100 flex items-center justify-center">
                          <span className="text-xs text-gray-500">No image</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{item.product.title}</TableCell>
                    <TableCell>{item.product.isbn13 || 'N/A'}</TableCell>
                    <TableCell>
                      {item.customPrice !== undefined
                        ? `$${item.customPrice.toFixed(2)}`
                        : item.product.list_price
                        ? `$${item.product.list_price.toFixed(2)}`
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      
      case 'carousel':
        return (
          <div className="mt-4">
            <CarouselView 
              products={products} 
              displaySettings={displaySettings}
              onSelectProduct={handleSelectProduct}
            />
          </div>
        );
      
      case 'kanban':
        return (
          <div className="mt-4">
            <KanbanView 
              products={products} 
              displaySettings={displaySettings}
              onSelectProduct={handleSelectProduct}
            />
          </div>
        );
      
      default:
        return (
          <div className="text-muted-foreground py-4 text-center">
            Unknown view mode: {viewMode}
          </div>
        );
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Presentation controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Presentation Sections</h2>
        <div className="flex items-center gap-4">
          {/* View toggle component */}
          <ViewToggle 
            viewMode={viewMode}
            setViewMode={setViewMode}
            features={displaySettings?.features}
          />
          
          {isEditable && (
            <Button onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          )}
        </div>
      </div>
      
      {/* Display each section */}
      {sectionsData.length > 0 ? (
        sectionsData
          .sort((a, b) => (a.section_order || 0) - (b.section_order || 0))
          .map((section) => (
            <Card key={section.id} className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>{section.title}</CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </div>
                {isEditable && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSection(section)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSection(section.id)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                {/* Display section items based on view mode */}
                {itemsLoading ? (
                  <div className="py-4 text-center">Loading items...</div>
                ) : (
                  renderSectionItems(section)
                )}
              </CardContent>
            </Card>
          ))
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground">No sections in this presentation yet.</p>
            {isEditable && (
              <Button onClick={handleOpenDialog} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Section dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editSectionId ? 'Edit Section' : 'Create Section'}</DialogTitle>
            <DialogDescription>
              {editSectionId ? 'Edit the section details here.' : 'Create a new section for the presentation.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!editSectionId && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sectionType" className="text-right">
                  Section Type
                </Label>
                <Select onValueChange={handleSectionTypeChange} defaultValue={sectionType}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a section type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="products">Products</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sectionTitle" className="text-right">
                Section Title
              </Label>
              <Input
                type="text"
                id="sectionTitle"
                value={editSectionId ? editSectionTitle : sectionTitle}
                onChange={editSectionId ? handleEditSectionTitleChange : handleSectionTitleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="sectionDescription" className="text-right mt-2">
                Section Description
              </Label>
              <Textarea
                id="sectionDescription"
                value={editSectionId ? editSectionDescription : sectionDescription}
                onChange={editSectionId ? handleEditSectionDescriptionChange : handleSectionDescriptionChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sectionOrder" className="text-right">
                Section Order
              </Label>
              <Input
                type="number"
                id="sectionOrder"
                value={editSectionId ? editSectionOrder : sectionOrder}
                onChange={editSectionId ? handleEditSectionOrderChange : handleSectionOrderChange}
                className="col-span-3"
              />
            </div>
            
            {!editSectionId && sectionType === 'products' && (
              <ProductSection
                products={products}
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
                onProductsChange={handleProductsChange}
              />
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={handleCloseDialog}>
              Cancel
            </Button>
            {editSectionId ? (
              <Button onClick={handleUpdateSection}>Update Section</Button>
            ) : (
              <Button onClick={handleCreateSection}>Create Section</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PresentationSections;
