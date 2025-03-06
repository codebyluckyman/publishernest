
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardTitle, CardDescription } from "@/components/ui/card";

interface FormatTableHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showFilters: boolean;
  toggleFilters: () => void;
  onAddFormat: () => void;
  areFiltersActive: () => boolean;
  activeFiltersCount: number;
}

export function FormatTableHeader({
  searchQuery,
  setSearchQuery,
  showFilters,
  toggleFilters,
  onAddFormat,
  areFiltersActive,
  activeFiltersCount
}: FormatTableHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div>
        <CardTitle>Formats</CardTitle>
        <CardDescription>Manage your print formats</CardDescription>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search formats..."
            className="w-full md:w-[260px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="gap-1"
          onClick={toggleFilters}
        >
          Filters {areFiltersActive() && (
            <span className="ml-1 text-xs bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
        <Button className="gap-1" onClick={onAddFormat}>
          <PlusCircle className="h-4 w-4" />
          Add Format
        </Button>
      </div>
    </div>
  );
}
