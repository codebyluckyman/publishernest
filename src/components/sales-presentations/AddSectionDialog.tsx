
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductSectionForm } from './ProductSectionForm';
import { Plus } from 'lucide-react';

interface AddSectionDialogProps {
  onAddSection: (sectionData: {
    title: string;
    description?: string;
    section_type: 'products' | 'text' | 'media' | 'formats' | 'custom';
    content?: any;
    products?: Array<{
      productId: string;
      customPrice?: number;
      customDescription?: string;
    }>;
  }) => Promise<void>;
}

export function AddSectionDialog({ onAddSection }: AddSectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'text' | 'media'>('products');
  
  const handleSaveProductSection = async (data: {
    title: string;
    description: string;
    products: Array<{
      productId: string;
      customPrice?: number;
      customDescription?: string;
    }>;
  }) => {
    await onAddSection({
      title: data.title,
      description: data.description,
      section_type: 'products',
      content: { layout: 'grid' },
      products: data.products
    });
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
        </DialogHeader>
        
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'products' | 'text' | 'media')}
          className="w-full mt-4"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <ProductSectionForm onSave={handleSaveProductSection} />
          </TabsContent>
          
          <TabsContent value="text">
            <div className="text-center py-10">
              <p>Text section coming soon...</p>
            </div>
          </TabsContent>
          
          <TabsContent value="media">
            <div className="text-center py-10">
              <p>Media section coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
