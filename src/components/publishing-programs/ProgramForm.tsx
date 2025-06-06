
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { usePublishingPrograms } from "@/hooks/usePublishingPrograms";
import { PublishingProgram, CreatePublishingProgramInput } from "@/types/publishingProgram";

const programSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  program_year: z.number().optional(),
  target_budget: z.number().optional(),
  currency: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

interface ProgramFormProps {
  program?: PublishingProgram;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProgramForm({ program, onSuccess, onCancel }: ProgramFormProps) {
  const { createProgram, isCreating } = usePublishingPrograms();

  const form = useForm<CreatePublishingProgramInput>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: program?.name || "",
      description: program?.description || "",
      program_year: program?.program_year || new Date().getFullYear(),
      target_budget: program?.target_budget || undefined,
      currency: program?.currency || "USD",
      start_date: program?.start_date || "",
      end_date: program?.end_date || "",
    },
  });

  const onSubmit = (data: CreatePublishingProgramInput) => {
    const submitData = {
      ...data,
      program_year: data.program_year || undefined,
      target_budget: data.target_budget || undefined,
      start_date: data.start_date || undefined,
      end_date: data.end_date || undefined,
    };

    createProgram(submitData);
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., 2024 Children's Books Program" />
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
                <Textarea {...field} placeholder="Brief description of the program..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="program_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Program Year</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    value={field.value || ""}
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
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
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

        <div className="grid grid-cols-2 gap-4">
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

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Saving..." : program ? "Update Program" : "Create Program"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
