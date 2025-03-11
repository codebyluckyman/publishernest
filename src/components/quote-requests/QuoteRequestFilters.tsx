
import { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button'; 
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface QuoteRequestFiltersProps {
  status: string | null;
  dueDate: string | null;
  setFilters: Dispatch<SetStateAction<{ status: string | null; dueDate: string | null }>>;
  filterOptions: {
    status: string[];
  };
  resetFilters: () => void;
}

export function QuoteRequestFilters({
  status,
  dueDate,
  setFilters,
  filterOptions,
  resetFilters
}: QuoteRequestFiltersProps) {
  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value || null }));
  };

  const handleDueDateChange = (date: Date | undefined) => {
    setFilters(prev => ({ 
      ...prev, 
      dueDate: date ? format(date, 'yyyy-MM-dd') : null 
    }));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-md">
      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={status || ''}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger id="status" className="w-full sm:w-[180px]">
            <SelectValue placeholder="Any status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any status</SelectItem>
            {filterOptions.status.map((statusOption) => (
              <SelectItem key={statusOption} value={statusOption}>
                {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="due-date">Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="due-date"
              variant="outline"
              className={cn(
                "w-full sm:w-[240px] justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(new Date(dueDate), 'PPP') : "Select date"}
              {dueDate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilters(prev => ({ ...prev, dueDate: null }));
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate ? new Date(dueDate) : undefined}
              onSelect={handleDueDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-end mt-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
