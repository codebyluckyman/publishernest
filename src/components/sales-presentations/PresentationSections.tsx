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
import { Product } from '@/types/product';
import { ProductSection } from './ProductSection';
import { PresentationSection, PresentationItem } from '@/types/salesPresentation';
import { toast } from 'sonner';
import { ProductWithFormat } from '@/hooks/useProductsWithFormats';
import { adaptProductsToProductWithFormat } from "@/utils/productFormatAdapter";

interface PresentationSectionsProps {
  presentationId: string | undefined;
  products: Product[];
}

const PresentationSections: React.FC<PresentationSectionsProps> = ({ presentationId, products }) => {
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
  
  // Load sections on component mount
  useEffect(() => {
    if (sections.data) {
      setSectionsData(sections.data);
    }
  }, [sections.data]);
  
  // Update sectionsData when sections.data changes
  useEffect(() => {
    if (sections.data) {
      setSectionsData(sections.data);
    }
  }, [sections.data]);
  
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
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Presentation Sections</CardTitle>
          <CardDescription>Manage sections for this presentation</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sectionsData.map((section) => (
                <TableRow key={section.id}>
                  <TableCell>{section.title}</TableCell>
                  <TableCell>{section.section_type}</TableCell>
                  <TableCell>{section.section_order}</TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}>
                  <Button onClick={handleOpenDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
      
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
