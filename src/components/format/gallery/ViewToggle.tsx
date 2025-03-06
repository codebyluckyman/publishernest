
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";

export type ViewMode = "gallery" | "table";

interface ViewToggleProps { 
  viewMode: ViewMode; 
  setViewMode: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, setViewMode }: ViewToggleProps) {
  return (
    <div className="flex space-x-2">
      <Button
        variant={viewMode === "gallery" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("gallery")}
        title="Gallery view"
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "table" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("table")}
        title="Table view"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
