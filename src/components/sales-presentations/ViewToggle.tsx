
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table2, Layers, KanbanSquare } from "lucide-react";
import { PresentationViewMode, PresentationFeatures } from "@/types/salesPresentation";

interface ViewToggleProps {
  viewMode: PresentationViewMode;
  setViewMode: (mode: PresentationViewMode) => void;
  features?: PresentationFeatures;
}

export function ViewToggle({ viewMode, setViewMode, features }: ViewToggleProps) {
  // Default to showing all views if no features provided (backward compatibility)
  const enabledViews = features?.enabledViews || ['card', 'table', 'carousel', 'kanban'];
  const allowViewToggle = features?.allowViewToggle !== false;

  // Log to help with debugging
  console.log("ViewToggle - enabledViews:", enabledViews);
  
  // If view toggling is disabled or there's only one view, don't render the toggle
  if (!allowViewToggle || enabledViews.length <= 1) {
    return null;
  }

  const viewButtons = [
    {
      mode: 'card' as PresentationViewMode,
      icon: <LayoutGrid className="h-4 w-4" />,
      title: "Card view"
    },
    {
      mode: 'table' as PresentationViewMode,
      icon: <Table2 className="h-4 w-4" />,
      title: "Table view"
    },
    {
      mode: 'carousel' as PresentationViewMode,
      icon: <Layers className="h-4 w-4" />,
      title: "Carousel view"
    },
    {
      mode: 'kanban' as PresentationViewMode,
      icon: <KanbanSquare className="h-4 w-4" />,
      title: "Kanban view"
    }
  ];

  return (
    <div className="flex space-x-2">
      {viewButtons
        .filter(button => enabledViews.includes(button.mode))
        .map(button => (
          <Button
            key={button.mode}
            variant={viewMode === button.mode ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode(button.mode)}
            title={button.title}
          >
            {button.icon}
          </Button>
        ))
      }
    </div>
  );
}
