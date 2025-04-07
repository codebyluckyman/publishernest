
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UnitOfMeasureSelect } from "@/components/organizations/unitOfMeasures/UnitOfMeasureSelect";
import { toast } from "sonner";
import { createExtraCost } from "./extraCostsService";
import { ExtraCostTableItem } from "@/types/extraCost";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  unit_of_measure_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewExtraCostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId?: string;
  onExtraCostAdded: (newExtraCost: ExtraCostTableItem) => void;
}

export function NewExtraCostDialog({ 
  open, 
  onOpenChange, 
  organizationId,
  onExtraCostAdded
}: NewExtraCostDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      unit_of_measure_id: "",
    }
  });

  const handleSubmit = async (values: FormValues) => {
    if (!organizationId) {
      toast.error("Organization ID is required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const newExtraCost = await createExtraCost(organizationId, {
        name: values.name,
        description: values.description || "",
        unit_of_measure_id: values.unit_of_measure_id
      });
      
      toast.success(`"${values.name}" added to extra costs library`);
      onExtraCostAdded(newExtraCost);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding extra cost:", error);
      toast.error("Failed to add extra cost to library");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Extra Cost</DialogTitle>
          <DialogDescription>
            Create a new extra cost to add to your library.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Shrink Wrap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide additional details about this extra cost" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Additional information about this extra cost
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="unit_of_measure_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit of Measure (Optional)</FormLabel>
                  <FormControl>
                    <UnitOfMeasureSelect
                      organizationId={organizationId}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    The unit used to measure this extra cost
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Extra Cost"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
