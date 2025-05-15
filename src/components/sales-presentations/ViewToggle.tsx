
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";

type ViewMode = "grid" | "table";

interface ViewToggleProps { 
  viewMode: ViewMode; 
  setViewMode: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, setViewMode }: ViewToggleProps) {
  return (
    <div className="flex space-x-2">
      <Button
        variant={viewMode === "grid" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("grid")}
        title="Grid view"
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
