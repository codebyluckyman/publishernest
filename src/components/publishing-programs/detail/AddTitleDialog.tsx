
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CreateProgramTitleInput } from "@/types/publishingProgram";
import { useProgramTitles } from "@/hooks/usePublishingPrograms";

const addTitleSchema = z.object({
  working_title: z.string().min(1, "Working title is required"),
  target_isbn: z.string().optional(),
  planned_pub_date: z.string().optional(),
  content_brief: z.string().optional(),
  target_quantity: z.number().optional(),
  estimated_cost: z.number().optional(),
  notes: z.string().optional(),
});

interface AddTitleDialogProps {
  programFormatId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTitleDialog({ programFormatId, open, onOpenChange }: AddTitleDialogProps) {
  const { createTitle, isCreatingTitle } = useProgramTitles(programFormatId);

  const form = useForm<CreateProgramTitleInput>({
    resolver: zodResolver(addTitleSchema),
    defaultValues: {
      program_format_id: programFormatId,
      working_title: "",
      target_isbn: "",
      planned_pub_date: "",
      content_brief: "",
      target_quantity: undefined,
      estimated_cost: undefined,
      notes: "",
    },
  });

  const onSubmit = async (data: CreateProgramTitleInput) => {
    try {
      await createTitle(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error handling is already done in the mutation's onError
      console.error('Failed to create title:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Title</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="working_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Working Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., The Adventures of..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_isbn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target ISBN</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="978-0-123456-78-9" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="planned_pub_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Planned Publication Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content_brief"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Brief</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Brief description of the content..." />
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
                        placeholder="e.g., 2500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost</FormLabel>
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Additional notes about this title..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingTitle}>
                {isCreatingTitle ? "Adding..." : "Add Title"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
