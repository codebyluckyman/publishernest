
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { QuoteRequest } from "@/types/quoteRequest";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormatsApi, Format } from "@/hooks/useFormatsApi";
import { useOrganization } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const quoteRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  status: z.enum(["draft", "open", "closed"]),
  due_date: z.date().nullable().optional(),
  format_ids: z.array(z.string()).optional(),
});

type QuoteRequestFormValues = z.infer<typeof quoteRequestSchema>;

interface QuoteRequestFormProps {
  quoteRequest?: QuoteRequest;
  onSubmit: (data: QuoteRequestFormValues) => void;
  isSubmitting: boolean;
}

export function QuoteRequestForm({ quoteRequest, onSubmit, isSubmitting }: QuoteRequestFormProps) {
  const { currentOrganization } = useOrganization();
  const { formats, isLoadingFormats, fetchQuoteRequestFormats } = useFormatsApi(currentOrganization);
  const [selectedFormatIds, setSelectedFormatIds] = useState<string[]>([]);

  const form = useForm<QuoteRequestFormValues>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      title: quoteRequest?.title || "",
      description: quoteRequest?.description || "",
      status: quoteRequest?.status || "draft",
      due_date: quoteRequest?.due_date ? new Date(quoteRequest.due_date) : null,
      format_ids: [],
    },
  });

  // Fetch linked formats when editing an existing quote request
  useEffect(() => {
    const loadLinkedFormats = async () => {
      if (quoteRequest?.id) {
        const formatIds = await fetchQuoteRequestFormats(quoteRequest.id);
        setSelectedFormatIds(formatIds);
        form.setValue('format_ids', formatIds);
      }
    };

    loadLinkedFormats();
  }, [quoteRequest?.id, fetchQuoteRequestFormats, form]);

  const handleFormatToggle = (formatId: string, checked: boolean) => {
    const updatedFormatIds = checked
      ? [...selectedFormatIds, formatId]
      : selectedFormatIds.filter(id => id !== formatId);
    
    setSelectedFormatIds(updatedFormatIds);
    form.setValue('format_ids', updatedFormatIds);
  };

  const handleSubmitWithFormats = async (data: QuoteRequestFormValues) => {
    try {
      // First submit the quote request
      await onSubmit(data);

      // The onSubmit callback will handle creating/updating the quote request
      // After that's done, we'll handle the format links in the QuoteRequestDialog component
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Failed to save quote request");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitWithFormats)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a title for this quote request" {...field} />
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
                  placeholder="Describe what you're requesting quotes for"
                  className="min-h-20"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
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
                    selected={field.value || undefined}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="format_ids"
          render={() => (
            <FormItem>
              <FormLabel>Formats</FormLabel>
              <div className="border rounded-md p-4 space-y-2">
                {isLoadingFormats ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : formats.length === 0 ? (
                  <p className="text-muted-foreground py-2 text-center">No formats available</p>
                ) : (
                  formats.map((format: Format) => (
                    <div key={format.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`format-${format.id}`} 
                        checked={selectedFormatIds.includes(format.id)}
                        onCheckedChange={(checked) => handleFormatToggle(format.id, checked === true)}
                      />
                      <label 
                        htmlFor={`format-${format.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {format.format_name}
                      </label>
                    </div>
                  ))
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {quoteRequest ? 'Update Quote Request' : 'Create Quote Request'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
