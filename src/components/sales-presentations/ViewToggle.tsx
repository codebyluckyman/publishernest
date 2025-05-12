
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table2, Layers, KanbanSquare } from "lucide-react";
import { PresentationViewMode } from "@/types/salesPresentation";

interface ViewToggleProps {
  viewMode: PresentationViewMode;
  setViewMode: (mode: PresentationViewMode) => void;
}

export function ViewToggle({ viewMode, setViewMode }: ViewToggleProps) {
  return (
    <div className="flex space-x-2">
      <Button
        variant={viewMode === "card" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("card")}
        title="Card view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "table" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("table")}
        title="Table view"
      >
        <Table2 className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "carousel" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("carousel")}
        title="Carousel view"
      >
        <Layers className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "kanban" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("kanban")}
        title="Kanban view"
      >
        <KanbanSquare className="h-4 w-4" />
      </Button>
    </div>
  );
}
