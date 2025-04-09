
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerRequirement, RequirementType } from '@/types/customerRequirement';

// Schema for form validation
const requirementSchema = z.object({
  requirement_type: z.enum(['packaging', 'shipping', 'quality', 'documentation', 'approval', 'payment', 'other'] as const),
  description: z.string().min(1, { message: 'Description is required' }),
  is_mandatory: z.boolean().default(false),
});

type RequirementFormValues = z.infer<typeof requirementSchema>;

interface RequirementFormProps {
  customerId: string;
  defaultValues?: Partial<RequirementFormValues>;
  onSubmit: (data: RequirementFormValues) => void;
  isSubmitting?: boolean;
}

export function RequirementForm({ customerId, defaultValues, onSubmit, isSubmitting }: RequirementFormProps) {
  const form = useForm<RequirementFormValues>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      requirement_type: 'other',
      description: '',
      is_mandatory: false,
      ...defaultValues,
    },
  });

  const handleSubmit = (values: RequirementFormValues) => {
    onSubmit({
      ...values,
      requirement_type: values.requirement_type as RequirementType,
    });
  };

  const requirementTypes: { value: RequirementType; label: string }[] = [
    { value: 'packaging', label: 'Packaging' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'quality', label: 'Quality Control' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'approval', label: 'Approval Process' },
    { value: 'payment', label: 'Payment' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="requirement_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirement Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a requirement type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {requirementTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The category of this customer requirement
              </FormDescription>
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
                  placeholder="Describe the requirement in detail"
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
          name="is_mandatory"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Mandatory Requirement</FormLabel>
                <FormDescription>
                  Mark if this requirement must be fulfilled for all sales orders
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Requirement'}
        </Button>
      </form>
    </Form>
  );
}
