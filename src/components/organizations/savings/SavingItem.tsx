
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { DefaultSaving } from "@/types/saving";
import { UnitOfMeasureSelect } from "../unitOfMeasures/UnitOfMeasureSelect";

interface SavingItemProps {
  saving: DefaultSaving;
  index: number;
  onUpdate: (index: number, field: keyof DefaultSaving, value: string) => void;
  onRemove: (index: number) => void;
}

export function SavingItem({ saving, index, onUpdate, onRemove }: SavingItemProps) {
  return (
    <div className="grid grid-cols-12 gap-2 items-start">
      <div className="col-span-4">
        <Input
          placeholder="Saving name"
          value={saving.name}
          onChange={(e) => onUpdate(index, 'name', e.target.value)}
          className="w-full"
        />
      </div>
      <div className="col-span-5">
        <Textarea
          placeholder="Description (optional)"
          value={saving.description || ""}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          className="w-full h-10 min-h-10 resize-none"
        />
      </div>
      <div className="col-span-2">
        <UnitOfMeasureSelect
          value={saving.unit_of_measure_id || ""}
          onChange={(value) => onUpdate(index, 'unit_of_measure_id', value)}
          placeholder="Unit"
          className="w-full"
        />
      </div>
      <div className="col-span-1 flex justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
