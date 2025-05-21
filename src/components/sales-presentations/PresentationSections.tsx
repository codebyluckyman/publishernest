
import { useState, useEffect } from 'react';
import { usePresentationSections } from '@/hooks/usePresentationSections';
import { useSectionItems } from '@/hooks/useSectionItems';
import { PresentationDisplaySettings, PresentationViewMode } from '@/types/salesPresentation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductSection } from './ProductSection';
import { ViewToggle } from './ViewToggle';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AddSectionDialog } from './AddSectionDialog';
import { recordSectionView } from '@/api/salesPresentations/trackPresentationView';

interface PresentationSectionsProps {
  presentationId: string;
  isEditable: boolean;
  displaySettings: PresentationDisplaySettings;
  viewId?: string;
  isPublicView?: boolean;
}

export const PresentationSections = ({ 
  presentationId, 
  isEditable,
  displaySettings, 
  viewId,
  isPublicView = false
}: PresentationSectionsProps) => {
  const { sections } = usePresentationSections(presentationId);
  const [currentViewMode, setCurrentViewMode] = useState<PresentationViewMode>(
    displaySettings.defaultView || 'card'
  );
  
  const [addSectionDialogOpen, setAddSectionDialogOpen] = useState(false);
  
  // Get all section IDs for fetching items
  const sectionIds = sections.data ? sections.data.map(section => section.id) : [];
  
  // Fetch all items at once
  const { data: itemsBySection, isLoading: isLoadingItems } = useSectionItems(sectionIds);
  
  // Function to track section views
  const trackSectionView = async (sectionId: string) => {
    if (viewId && isPublicView) {
      await recordSectionView(presentationId, viewId, sectionId);
    }
  };

  if (sections.isLoading) {
    return (
      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-64" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sections.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load presentation sections.
        </AlertDescription>
      </Alert>
    );
  }

  if (sections.data && sections.data.length === 0 && !isEditable) {
    return (
      <Alert>
        <AlertDescription>
          This presentation has no content sections.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {!isPublicView && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Presentation Content</h2>
            <p className="text-sm text-muted-foreground">
              {sections.data?.length || 0} section{sections.data && sections.data.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {isEditable && (
            <div className="flex space-x-4 items-center">
              <ViewToggle 
                viewMode={currentViewMode}
                setViewMode={setCurrentViewMode}
                features={displaySettings.features || {
                  enabledViews: ['card', 'table'],
                  allowViewToggle: true,
                  showProductDetails: true
                }}
              />
            </div>
          )}
        </div>
      )}
      
      {isEditable && (
        <AddSectionDialog
          open={addSectionDialogOpen}
          onOpenChange={setAddSectionDialogOpen}
          presentationId={presentationId}
          currentSectionCount={sections.data?.length || 0}
        />
      )}
      
      {isPublicView && (
        <div className="flex justify-end">
          <ViewToggle 
            viewMode={currentViewMode}
            setViewMode={setCurrentViewMode}
            features={displaySettings.features || {
              enabledViews: ['card', 'table'],
              allowViewToggle: true,
              showProductDetails: true
            }}
          />
        </div>
      )}
      
      <div className="space-y-12">
        {sections.data?.map((section) => {
          const sectionItems = itemsBySection?.get(section.id) || [];
          
          // Track section view when it's viewed
          useEffect(() => {
            trackSectionView(section.id);
          }, [section.id]);
          
          return (
            <div 
              key={section.id} 
              className="space-y-4"
              id={`section-${section.id}`}
            >
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{section.title}</h2>
                {section.description && (
                  <p className="text-muted-foreground">{section.description}</p>
                )}
              </div>
              
              <ProductSection
                sectionId={section.id}
                presentationId={presentationId}
                items={sectionItems}
                isLoading={isLoadingItems}
                isEditable={isEditable}
                viewMode={currentViewMode}
                displaySettings={displaySettings}
                viewId={viewId}
                isPublicView={isPublicView}
              />
            </div>
          );
        })}
        
        {isEditable && sections.data && sections.data.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <h3 className="text-lg font-medium">No sections yet</h3>
            <p className="text-muted-foreground mt-1">
              Start by adding a section to your presentation.
            </p>
            <button 
              onClick={() => setAddSectionDialogOpen(true)}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
            >
              Add Section
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
