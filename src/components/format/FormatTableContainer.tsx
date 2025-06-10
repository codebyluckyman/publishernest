
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/hooks/useOrganization";
import { useFormats } from "@/hooks/useFormats";
import { FormatTable } from "./FormatTable";
import { FormatEmptyState } from "./FormatEmptyState";
import { FormatFilters, FilterOptions, FILTER_VALUES } from "./FormatFilters";
import { FormatDialog } from "@/components/FormatDialog";
import { FormatViewDialog } from "@/components/FormatViewDialog";
import { toast } from "sonner";

// AI navigation state interface
interface AIFormatCreationState {
  createFormat: boolean;
  specifications: any;
  template: string;
  aiGenerated?: boolean;
  source?: string;
}

export function FormatTableContainer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isFormatDialogOpen, setIsFormatDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);
  const [aiGeneratedSpecs, setAiGeneratedSpecs] = useState<any>(null);
  
  const [filters, setFilters] = useState<FilterOptions>({
    cover_stock_print: FILTER_VALUES.ALL_STOCK,
    internal_stock_print: FILTER_VALUES.ALL_STOCK,
  });

  const {
    data: formats = [],
    isLoading,
    error,
    refetch,
  } = useFormats(currentOrganization?.id, searchQuery, filters);

  // Handle AI navigation state
  useEffect(() => {
    const navigationState = location.state as AIFormatCreationState | null;
    
    if (navigationState?.createFormat && navigationState?.specifications && navigationState?.source === 'ai-assistant') {
      console.log('AI Format Creation State detected:', navigationState);
      
      // Set the AI generated specifications
      setAiGeneratedSpecs(navigationState.specifications);
      
      // Open the format dialog
      setIsFormatDialogOpen(true);
      
      // Clear the navigation state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: null });
      
      // Show success message
      toast.success('AI generated format specifications loaded. Please review and save.');
    }
  }, [location.state, location.pathname, navigate]);

  const resetFilters = () => {
    setFilters({
      cover_stock_print: FILTER_VALUES.ALL_STOCK,
      internal_stock_print: FILTER_VALUES.ALL_STOCK,
    });
  };

  const handleAddFormat = () => {
    setAiGeneratedSpecs(null); // Clear any AI specs when manually adding
    setIsFormatDialogOpen(true);
  };

  const handleViewFormat = (formatId: string) => {
    setSelectedFormatId(formatId);
    setIsViewDialogOpen(true);
  };

  const handleEditFormat = (formatId: string) => {
    setSelectedFormatId(formatId);
    setAiGeneratedSpecs(null); // Clear AI specs when editing existing format
    setIsFormatDialogOpen(true);
  };

  const handleFormatDialogClose = () => {
    setIsFormatDialogOpen(false);
    setSelectedFormatId(null);
    setAiGeneratedSpecs(null); // Clear AI specs when dialog closes
  };

  const handleFormatCopied = (newFormatId?: string) => {
    if (newFormatId) {
      toast.success("Format copied successfully");
      refetch();
    }
  };

  const handleFormatSaved = () => {
    setAiGeneratedSpecs(null); // Clear AI specs after successful save
    refetch();
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">Error loading formats: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="p-6">
        <FormatEmptyState hasOrganization={false} onAddFormat={handleAddFormat} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search formats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border rounded-md w-64"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
        <Button onClick={handleAddFormat}>
          <Plus className="mr-2 h-4 w-4" />
          Add Format
        </Button>
      </div>

      <FormatFilters
        filters={filters}
        setFilters={setFilters}
        filterOptions={{
          cover_stock_print: [...new Set(formats.map(f => f.cover_stock_print).filter(Boolean))],
          internal_stock_print: [...new Set(formats.map(f => f.internal_stock_print).filter(Boolean))],
        }}
        showFilters={showFilters}
        resetFilters={resetFilters}
      />

      {isLoading ? (
        <div className="p-6 text-center">Loading formats...</div>
      ) : formats.length === 0 ? (
        <FormatEmptyState hasOrganization={true} onAddFormat={handleAddFormat} />
      ) : (
        <FormatTable
          formats={formats}
          onViewFormat={handleViewFormat}
          onEditFormat={handleEditFormat}
          onFormatCopied={handleFormatCopied}
        />
      )}

      <FormatDialog
        open={isFormatDialogOpen}
        onOpenChange={handleFormatDialogClose}
        formatId={selectedFormatId}
        initialValues={aiGeneratedSpecs}
        aiGenerated={!!aiGeneratedSpecs}
        onSuccess={handleFormatSaved}
      />

      <FormatViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        formatId={selectedFormatId}
      />
    </div>
  );
}
