
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnhancedTagsInput } from "./EnhancedTagsInput";
import { CreatePublishingProgramInput, PublishingProgram, ProgramTag } from "@/types/publishingProgram";
import { usePublishingPrograms } from "@/hooks/usePublishingPrograms";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  description: z.string().optional(),
  program_year: z.number().optional(),
  target_budget: z.number().optional(),
  currency: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  tags: z.array(z.object({
    name: z.string(),
    color: z.enum(['green', 'blue', 'purple', 'orange', 'red', 'yellow', 'pink', 'gray'])
  })).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProgramFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  program?: PublishingProgram;
}

const currencies = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
];

export function ProgramForm({ onSuccess, onCancel, program }: ProgramFormProps) {
  const { createProgram, isCreating } = usePublishingPrograms();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: program?.name || "",
      description: program?.description || "",
      program_year: program?.program_year || new Date().getFullYear(),
      target_budget: program?.target_budget || undefined,
      currency: program?.currency || "USD",
      start_date: program?.start_date || "",
      end_date: program?.end_date || "",
      tags: program?.tags as ProgramTag[] || [],
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      // Ensure name is provided (TypeScript will enforce this, but runtime check for safety)
      if (!values.name) {
        toast.error("Program name is required");
        return;
      }

      // Make sure all tags have required properties
      const validatedTags: ProgramTag[] = (values.tags || []).map(tag => ({
        name: tag.name,
        color: tag.color
      }));

      const programData: CreatePublishingProgramInput = {
        name: values.name,
        description: values.description,
        program_year: values.program_year,
        target_budget: values.target_budget,
        currency: values.currency,
        start_date: values.start_date,
        end_date: values.end_date,
        tags: validatedTags,
      };

      await createProgram(programData);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating program:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter program name" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter program description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="program_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Program Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="2024"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="target_budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Budget</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter target budget"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
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
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <EnhancedTagsInput
                  tags={field.value as ProgramTag[] || []}
                  onChange={(tags: ProgramTag[]) => field.onChange(tags)}
                  placeholder="Add tags to categorize this program..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Program"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
