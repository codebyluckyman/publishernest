
import React, { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { usePresentationSections } from '@/hooks/usePresentationSections';
import { PresentationSection, PresentationDisplaySettings } from '@/types/salesPresentation';
import AddSectionDialog from './AddSectionDialog';
import ProductSection from './ProductSection';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PresentationSectionsProps {
  presentationId: string;
  isEditable?: boolean;
  displaySettings: PresentationDisplaySettings;
  isSharedView?: boolean;
}

export const PresentationSections: React.FC<PresentationSectionsProps> = ({
  presentationId,
  isEditable = true,
  displaySettings,
  isSharedView = false
}) => {
  const [isAddingSectionOpen, setIsAddingSectionOpen] = useState(false);
  const { toast } = useToast();
  
  const {
    sections,
    loading,
    error,
    createSection,
    updateSection,
    deleteSection,
    moveSection,
  } = usePresentationSections(presentationId);

  const handleCreateSection = async (sectionData: Partial<PresentationSection>) => {
    try {
      await createSection({
        ...sectionData,
        presentation_id: presentationId
      });
      toast({ description: "Section created successfully" });
      setIsAddingSectionOpen(false);
    } catch (err) {
      toast({ 
        title: "Failed to create section", 
        description: "Please try again later", 
        variant: "destructive" 
      });
    }
  };

  const handleMoveSection = async (sectionId: string, direction: 'up' | 'down') => {
    try {
      await moveSection(sectionId, direction);
    } catch (err) {
      toast({ 
        title: "Failed to move section", 
        description: "Please try again later", 
        variant: "destructive" 
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-red-500">
            Failed to load presentation sections. Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6 text-center">
            {isEditable ? (
              <>
                <p className="mb-4">This presentation doesn't have any sections yet.</p>
                <Button onClick={() => setIsAddingSectionOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Section
                </Button>
                
                <AddSectionDialog 
                  open={isAddingSectionOpen} 
                  onOpenChange={setIsAddingSectionOpen}
                  onSave={handleCreateSection}
                />
              </>
            ) : (
              <p>This presentation doesn't have any content yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full" defaultValue={sections.map(s => s.id)}>
        {sections.map((section) => (
          <AccordionItem key={section.id} value={section.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <span className="font-medium text-lg">{section.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {section.section_type === 'products' && (
                <ProductSection 
                  section={section} 
                  isEditable={isEditable} 
                  displaySettings={displaySettings}
                  isSharedView={isSharedView}
                />
              )}
              
              {section.section_type === 'text' && (
                <div className="prose max-w-none dark:prose-invert">
                  {section.content && typeof section.content === 'string' ? (
                    <div dangerouslySetInnerHTML={{ __html: section.content }} />
                  ) : (
                    <p>No content</p>
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {isEditable && (
        <div className="flex justify-center mt-6">
          <Button onClick={() => setIsAddingSectionOpen(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>
      )}
      
      {isEditable && (
        <AddSectionDialog 
          open={isAddingSectionOpen} 
          onOpenChange={setIsAddingSectionOpen}
          onSave={handleCreateSection}
        />
      )}
    </div>
  );
};
