import { useState } from "react";
import { usePresentationSections } from "@/hooks/usePresentationSections";
import { useSectionItems } from "@/hooks/useSectionItems";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddSectionDialog } from "./AddSectionDialog";
import { ProductSectionDisplay } from "./ProductSectionDisplay";

interface PresentationSectionsProps {
  presentationId: string;
  presentationDisplaySettings?: any;
  editable?: boolean;
}

export function PresentationSections({
  presentationId,
  presentationDisplaySettings,
  editable = false,
}: PresentationSectionsProps) {
  const { sections } = usePresentationSections(presentationId);
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);
  
  const sectionIds = sections.data?.map(section => section.id) || [];
  const { data: sectionItemsMap, isLoading: itemsLoading } = useSectionItems(sectionIds);
  
  if (sections.isLoading || itemsLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading presentation content...</div>;
  }
  
  if (!sections.data || sections.data.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground mb-4">This presentation doesn't have any sections yet.</p>
        {editable && (
          <Button onClick={() => setIsAddSectionDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        )}
        {editable && (
          <AddSectionDialog
            presentationId={presentationId}
            open={isAddSectionDialogOpen}
            onOpenChange={setIsAddSectionDialogOpen}
          />
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-12">
      {sections.data.map((section) => {
        const items = sectionItemsMap?.get(section.id) || [];
        
        return (
          <div key={section.id} className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{section.title}</h2>
              {section.description && (
                <p className="text-muted-foreground mt-1">{section.description}</p>
              )}
            </div>
            
            {section.section_type === "products" && (
              <ProductSectionDisplay 
                items={items}
                displaySettings={presentationDisplaySettings}
              />
            )}
            
            {section.section_type === "text" && (
              <div className="prose dark:prose-invert max-w-none">
                {section.content?.text || <p className="text-muted-foreground">No content</p>}
              </div>
            )}
            
            {section.section_type === "media" && (
              <div>
                {/* Media section rendering will be implemented later */}
                <p className="text-muted-foreground">Media content</p>
              </div>
            )}
          </div>
        );
      })}
      
      {editable && (
        <div className="pt-4">
          <Button onClick={() => setIsAddSectionDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      )}
      
      {editable && (
        <AddSectionDialog
          presentationId={presentationId}
          open={isAddSectionDialogOpen}
          onOpenChange={setIsAddSectionDialogOpen}
        />
      )}
    </div>
  );
}
