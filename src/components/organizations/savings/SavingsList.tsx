
import { Button } from "@/components/ui/button";
import { DefaultSaving, SavingTableItem } from "@/types/saving";
import { Plus } from "lucide-react";
import { SavingItem } from "./SavingItem";
import { EmptySavings } from "./EmptySavings";
import { SavingLibraryDialog } from "./SavingLibraryDialog";

interface SavingsListProps {
  savings: DefaultSaving[];
  organizationId: string;
  onAddSaving: () => void;
  onRemoveSaving: (index: number) => void;
  onUpdateSaving: (index: number, field: keyof DefaultSaving, value: string) => void;
  onAddFromLibrary: (saving: SavingTableItem) => void;
}

export function SavingsList({ 
  savings, 
  organizationId,
  onAddSaving, 
  onRemoveSaving, 
  onUpdateSaving,
  onAddFromLibrary
}: SavingsListProps) {
  return (
    <div className="space-y-4">
      {savings.length === 0 ? (
        <EmptySavings />
      ) : (
        <div className="space-y-4">
          {savings.map((saving, index) => (
            <SavingItem
              key={index}
              saving={saving}
              index={index}
              onUpdate={onUpdateSaving}
              onRemove={onRemoveSaving}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={onAddSaving}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Saving
          </Button>
          
          {organizationId && (
            <SavingLibraryDialog 
              organizationId={organizationId} 
              onAddFromLibrary={onAddFromLibrary} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
