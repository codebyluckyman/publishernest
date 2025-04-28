
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

// Available column options
const displayColumnOptions = [
  { id: 'price', label: 'Price' },
  { id: 'isbn13', label: 'ISBN-13' },
  { id: 'publisher', label: 'Publisher' },
  { id: 'publication_date', label: 'Publication Date' },
  { id: 'format', label: 'Format Details' },
] as const;

// Validation schema
const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  displayColumns: z.array(z.string()).min(1, { message: 'Select at least one column to display' }),
});

type FormValues = z.infer<typeof formSchema>;

interface CreatePresentationFormProps {
  onSubmit: (data: FormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function CreatePresentationForm({ onSubmit, isSubmitting }: CreatePresentationFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      displayColumns: ['price', 'isbn13', 'publisher', 'publication_date'],
    },
  });

  const handleSubmit = async (data: FormValues) => {
    await onSubmit({
      ...data,
      displayColumns: data.displayColumns,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presentation Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a title for your presentation" {...field} />
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
                        placeholder="Describe the purpose of this presentation"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayColumns"
                render={() => (
                  <FormItem>
                    <FormLabel>Display Columns</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      {displayColumnOptions.map((option) => (
                        <FormField
                          key={option.id}
                          control={form.control}
                          name="displayColumns"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={option.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, option.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== option.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Presentation'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
