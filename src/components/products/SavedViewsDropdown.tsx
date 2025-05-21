
import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Check, PlusCircle, Save, Settings, Star, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SaveViewDialog } from "./SaveViewDialog";
import { ProductSavedView } from "@/types/productSavedView";
import { ProductFilters } from "@/types/product";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SavedViewsDropdownProps {
  views: ProductSavedView[];
  currentView: ProductSavedView | null;
  activeFilterCount: number;
  currentSearchQuery: string;
  currentFilters: ProductFilters;
  onSelectView: (view: ProductSavedView) => void;
  onSaveView: (name: string, description: string | null, isDefault: boolean) => void;
  onUpdateView: (view: ProductSavedView, name: string, description: string | null, isDefault: boolean) => void;
  onDeleteView: (view: ProductSavedView) => void;
  onSetDefaultView: (view: ProductSavedView) => void;
}

export function SavedViewsDropdown({
  views,
  currentView,
  activeFilterCount,
  currentSearchQuery,
  currentFilters,
  onSelectView,
  onSaveView,
  onUpdateView,
  onDeleteView,
  onSetDefaultView,
}: SavedViewsDropdownProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<ProductSavedView | null>(null);

  const hasActiveFilters = activeFilterCount > 0 || !!currentSearchQuery;

  const handleSelectView = (view: ProductSavedView) => {
    onSelectView(view);
  };

  const handleSaveView = (values: { name: string; description: string | null; is_default: boolean }) => {
    onSaveView(values.name, values.description, values.is_default);
  };

  const handleEditView = (view: ProductSavedView) => {
    setSelectedView(view);
    setIsEditDialogOpen(true);
  };

  const handleUpdateView = (values: { name: string; description: string | null; is_default: boolean }) => {
    if (selectedView) {
      onUpdateView(selectedView, values.name, values.description, values.is_default);
    }
  };

  const handleDeleteView = (view: ProductSavedView) => {
    setSelectedView(view);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteView = () => {
    if (selectedView) {
      onDeleteView(selectedView);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleSetDefaultView = (view: ProductSavedView) => {
    onSetDefaultView(view);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Views
            {currentView && (
              <Badge variant="outline" className="ml-1">
                {currentView.name}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Saved Views</DropdownMenuLabel>
          {views.length > 0 ? (
            <DropdownMenuGroup>
              {views.map((view) => (
                <DropdownMenuItem
                  key={view.id}
                  onSelect={(e) => { 
                    e.preventDefault();
                    handleSelectView(view);
                  }}
                  className="flex justify-between items-center cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {view.is_default && <Star className="h-4 w-4 text-yellow-500" />}
                    <span>{view.name}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.stopPropagation();
                          handleEditView(view);
                        }}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      {!view.is_default && (
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.stopPropagation();
                            handleSetDefaultView(view);
                          }}
                        >
                          <Star className="mr-2 h-4 w-4" />
                          <span>Set as Default</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.stopPropagation();
                          handleDeleteView(view);
                        }}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ) : (
            <DropdownMenuItem disabled>No saved views</DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            disabled={!hasActiveFilters}
            onSelect={(e) => { 
              e.preventDefault();
              setIsSaveDialogOpen(true);
            }}
          >
            <Save className="mr-2 h-4 w-4" />
            <span>Save Current View</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SaveViewDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSaveView}
      />

      <SaveViewDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleUpdateView}
        currentView={selectedView || undefined}
        isEditing
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the saved view "{selectedView?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteView} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
