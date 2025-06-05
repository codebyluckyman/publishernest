
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePublishingPrograms } from "@/hooks/usePublishingPrograms";
import { CreatePublishingProgramInput } from "@/types/publishingProgram";

interface CreateProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProgramDialog({ open, onOpenChange }: CreateProgramDialogProps) {
  const { createProgram, isCreating } = usePublishingPrograms();
  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState<CreatePublishingProgramInput>({
    name: '',
    description: '',
    program_year: currentYear,
    target_budget: undefined,
    currency: 'USD',
    start_date: '',
    end_date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      target_budget: formData.target_budget ? Number(formData.target_budget) : undefined,
    };
    
    createProgram(submitData, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          name: '',
          description: '',
          program_year: currentYear,
          target_budget: undefined,
          currency: 'USD',
          start_date: '',
          end_date: '',
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Publishing Program</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Program Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 2025 Early Learning Series"
                required
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the program"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="program_year">Program Year</Label>
              <Input
                id="program_year"
                type="number"
                value={formData.program_year || ''}
                onChange={(e) => setFormData({ ...formData, program_year: e.target.value ? Number(e.target.value) : undefined })}
                placeholder={currentYear.toString()}
              />
            </div>
            
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="target_budget">Target Budget</Label>
              <Input
                id="target_budget"
                type="number"
                step="0.01"
                value={formData.target_budget || ''}
                onChange={(e) => setFormData({ ...formData, target_budget: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !formData.name.trim()}>
              {isCreating ? 'Creating...' : 'Create Program'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
