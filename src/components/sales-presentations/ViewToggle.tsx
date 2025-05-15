
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table2, Layers, KanbanSquare } from "lucide-react";
import { PresentationViewMode, PresentationFeatures } from "@/types/salesPresentation";

// Default values for features
const defaultEnabledViews: PresentationViewMode[] = ['card', 'table'];

interface ViewToggleProps {
  viewMode: PresentationViewMode;
  setViewMode: (mode: PresentationViewMode) => void;
  features?: PresentationFeatures;
}

export function ViewToggle({ viewMode, setViewMode, features }: ViewToggleProps) {
  // Default to showing card and table views if no features provided (backward compatibility)
  const enabledViews = features?.enabledViews || defaultEnabledViews;
  const allowViewToggle = features?.allowViewToggle !== false;

  // Log to help with debugging
  console.log("ViewToggle - enabledViews:", enabledViews);
  console.log("ViewToggle - current viewMode:", viewMode);
  
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

  // Only show buttons for enabled views
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
