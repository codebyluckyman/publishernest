
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { File, FileMinus, Archive, Check } from "lucide-react";
import { memo } from "react";

export type PresentationStatus = 'all' | 'draft' | 'published' | 'archived';

interface StatusFilterProps {
  value: PresentationStatus;
  onValueChange: (value: PresentationStatus) => void;
  className?: string;
  disabled?: boolean;
}

export const StatusFilter = memo(function StatusFilter({ 
  value, 
  onValueChange, 
  className, 
  disabled = false 
}: StatusFilterProps) {
  const handleValueChange = (val: string) => {
    onValueChange(val as PresentationStatus);
  };

  return (
    <Select
      value={value}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Filter by status">
          <div className="flex items-center gap-2">
            {value === 'all' && <File className="h-4 w-4" />}
            {value === 'draft' && <FileMinus className="h-4 w-4" />}
            {value === 'published' && <Check className="h-4 w-4" />}
            {value === 'archived' && <Archive className="h-4 w-4" />}
            {value === 'all' ? 'All statuses' : value.charAt(0).toUpperCase() + value.slice(1)}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4" />
            <span>All statuses</span>
          </div>
        </SelectItem>
        <SelectItem value="draft">
          <div className="flex items-center gap-2">
            <FileMinus className="h-4 w-4" />
            <span>Draft</span>
          </div>
        </SelectItem>
        <SelectItem value="published">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>Published</span>
          </div>
        </SelectItem>
        <SelectItem value="archived">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            <span>Archived</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
});
