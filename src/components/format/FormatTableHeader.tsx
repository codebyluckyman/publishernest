
import { PlusCircle, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { debounce } from "lodash";

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
  activeFiltersCount,
}: FormatTableHeaderProps) {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery);

  const debouncedSetSearchQuery = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 500),
    [setSearchQuery]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetSearchQuery(value);
  };

  return (
    <div className="pb-6 border-b">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
        <div>
          <h2 className="text-xl font-semibold">Formats</h2>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : "Manage your print formats and specifications"}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {isSearchActive ? (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search formats..."
                className="w-full pl-9 pr-9 sm:w-[250px]"
                value={inputValue}
                onChange={handleInputChange}
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9"
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchActive(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSearchActive(true)}
              className="h-9 w-9"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9">
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Print</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={onAddFormat} className="h-9 gap-1.5">
            <PlusCircle className="h-4 w-4" />
            Add Format
          </Button>
          <Button variant="outline" className="gap-1" onClick={toggleFilters}>
            Filters{" "}
            {areFiltersActive() && (
              <span className="ml-1 text-xs bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
