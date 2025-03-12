
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuoteRequestFormValues } from "@/types/quoteRequest";
import { Supplier } from "@/types/supplier";
import { useQuoteRequests } from "@/hooks/useQuoteRequests";
import { useOrganization } from "@/hooks/useOrganization";
import { useFormatsForSelect } from "@/hooks/useFormatsForSelect";
import { Card, CardContent } from "@/components/ui/card";

interface QuoteRequestFormProps {
  suppliers: Supplier[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  supplier_id: z.string().min(1, "Supplier is required"),
  description: z.string().optional(),
  expected_delivery_date: z.date().optional(),
  notes: z.string().optional(),
  formats: z.array(
    z.object({
      format_id: z.string().min(1, "Format is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      notes: z.string().optional(),
    })
  ).optional(),
});

export function QuoteRequestForm({ suppliers, onSuccess, onCancel }: QuoteRequestFormProps) {
  const { currentOrganization } = useOrganization();
  const { useCreateQuoteRequest } = useQuoteRequests();
  const createMutation = useCreateQuoteRequest();
  const { data: formats = [], isLoading: isFormatsLoading } = useFormatsForSelect(currentOrganization);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      supplier_id: "",
      description: "",
      notes: "",
      formats: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "formats",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentOrganization) return;

    const formData: QuoteRequestFormValues = {
      title: values.title,
      supplier_id: values.supplier_id,
      description: values.description,
      expected_delivery_date: values.expected_delivery_date 
        ? format(values.expected_delivery_date, "yyyy-MM-dd") 
        : undefined,
      notes: values.notes,
      formats: values.formats?.map(f => ({
        format_id: f.format_id,
        quantity: f.quantity,
        notes: f.notes,
      })),
    };

    createMutation.mutate(
      { 
        formData, 
        organizationId: currentOrganization.id 
      },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  const addFormat = () => {
    append({
      format_id: "",
      quantity: 1,
      notes: "",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Quote request title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supplier_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.supplier_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  placeholder="Detailed description of the quote request" 
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expected_delivery_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Expected Delivery Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Formats</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addFormat}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Format
            </Button>
          </div>

          {fields.length === 0 && (
            <div className="text-center p-4 border border-dashed rounded-md">
              <p className="text-sm text-muted-foreground">
                No formats added yet. Click 'Add Format' to include formats in this quote request.
              </p>
            </div>
          )}

          {fields.map((field, index) => (
            <Card key={field.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium">Format {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`formats.${index}.format_id`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Format</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {formats.map((format) => (
                              <SelectItem key={format.id} value={format.id}>
                                {format.format_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`formats.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`formats.${index}.notes`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any specific notes about this format"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create Quote Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
