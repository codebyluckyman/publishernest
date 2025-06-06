import React from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormatsForSelect } from "@/hooks/useFormatsForSelect";
import { Combobox } from "@/components/ui/combobox";
import { CreateProgramFormatInput } from "@/types/publishingProgram";

const addFormatSchema = z.object({
  format_id: z.string().min(1, "Format is required"),
  target_quantity: z.number().optional(),
  budget_allocation: z.number().optional(),
  timeline_start: z.string().optional(),
  timeline_end: z.string().optional(),
  notes: z.string().optional(),
});

interface AddFormatDialogProps {
  programId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFormatDialog({ programId, open, onOpenChange }: AddFormatDialogProps) {
  const { formats, isLoading: formatsLoading } = useFormatsForSelect();

  const form = useForm<CreateProgramFormatInput>({
    resolver: zodResolver(addFormatSchema),
    defaultValues: {
      program_id: programId,
      format_id: "",
      target_quantity: undefined,
      budget_allocation: undefined,
      timeline_start: "",
      timeline_end: "",
      notes: "",
    },
  });

  const onSubmit = (data: CreateProgramFormatInput) => {
    console.log("Add format to program:", data);
    // TODO: Implement addFormatToProgram mutation
    onOpenChange(false);
  };

  // Transform formats data for the combobox - ensure this is always an array
  const formatOptions = Array.isArray(formats) 
    ? formats.map(format => ({
        label: format.format_name,
        value: format.id
      }))
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Format to Program</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="format_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Format</FormLabel>
                  <FormControl>
                    <Combobox
                      items={formatOptions}
                      value={field.value || ""}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                      placeholder="Select a format"
                      searchPlaceholder="Search formats..."
                      emptyMessage="No format found."
                      disabled={formatsLoading}
                      isLoading={formatsLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="target_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        value={field.value || ""}
                        placeholder="e.g., 5000"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget_allocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Allocation</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        value={field.value || ""}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timeline_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeline Start</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeline_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeline End</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Additional notes about this format..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Format
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
