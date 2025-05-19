
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
  onSave: (sectionData: {
    title: string;
    description: string;
    products: Array<{
      productId: string;
      customPrice?: number;
      customDescription?: string;
    }>;
  }) => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddSectionDialog({ onSave, open, onOpenChange }: AddSectionDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'text' | 'media'>('products');
  
  // Use either controlled or uncontrolled state
  const isOpen = open !== undefined ? open : localOpen;
  const handleOpenChange = onOpenChange || setLocalOpen;
  
  const handleSaveProductSection = async (data: {
    title: string;
    description: string;
    products: Array<{
      productId: string;
      customPrice?: number;
      customDescription?: string;
    }>;
  }) => {
    await onSave({
      title: data.title,
      description: data.description,
      products: data.products
    });
    
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
