import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PopoverAnchor,
  PopoverClose,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger as PopoverTriggerButton,
} from "@radix-ui/react-popover";
import {
  CardGridLayout,
  PresentationViewMode,
  CardWidthType,
} from "@/types/salesPresentation";
import { Slider } from "@/components/ui/slider";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  cardColumns: z.array(z.string()).optional(),
  dialogColumns: z.array(z.string()).optional(),
  defaultView: z.string().optional(),
  enabledViews: z.array(z.string()).optional(),
  allowViewToggle: z.boolean().optional(),
  showProductDetails: z.boolean().optional(),
  allowDownload: z.boolean().optional(),
  showPricing: z.boolean().optional(),
  cardWidthType: z.string().optional(),
  fixedCardWidth: z.number().optional(),
  cardGridLayout: z
    .object({
      sm: z.string().optional(),
      md: z.string().optional(),
      lg: z.string().optional(),
      xl: z.string().optional(),
      xxl: z.string().optional(),
    })
    .optional(),
});

interface CreatePresentationFormProps {
  onSubmit: (values: any) => void;
  isSubmitting: boolean;
}

export function CreatePresentationForm({
  onSubmit,
  isSubmitting,
}: CreatePresentationFormProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      cardColumns: ["title", "price", "isbn13"],
      dialogColumns: ["title", "price", "isbn13", "publisher", "synopsis"],
      defaultView: "card",
      enabledViews: ["card", "table", "carousel"],
      allowViewToggle: true,
      showProductDetails: true,
      allowDownload: false,
      showPricing: true,
      cardWidthType: "responsive",
      fixedCardWidth: 300,
      cardGridLayout: {
        sm: "1",
        md: "2",
        lg: "3",
        xl: "4",
        xxl: "5",
      },
    },
  });

  const columnOptions = [
    { id: "title", label: "Title" },
    { id: "price", label: "Price" },
    { id: "isbn13", label: "ISBN-13" },
    { id: "isbn10", label: "ISBN-10" },
    { id: "publisher", label: "Publisher" },
    { id: "publication_date", label: "Publication Date" },
    { id: "product_form", label: "Product Form" },
    { id: "format", label: "Format" },
    { id: "physical_properties", label: "Physical Properties" },
    { id: "selling_points", label: "Selling Points" },
  ];

  const viewOptions = [
    { id: "card", label: "Card View" },
    { id: "table", label: "Table View" },
    { id: "carousel", label: "Carousel View" },
  ];

  const cardWidthOptions = [
    { id: "responsive", label: "Responsive" },
    { id: "fixed", label: "Fixed" },
  ];

  const gridLayoutOptions = [
    { id: "1", label: "1 Column" },
    { id: "2", label: "2 Columns" },
    { id: "3", label: "3 Columns" },
    { id: "4", label: "4 Columns" },
    { id: "5", label: "5 Columns" },
    { id: "6", label: "6 Columns" },
  ];

  const onSubmitHandler = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitHandler)}
        className="space-y-8"
      >
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Presentation Title" {...field} />
                </FormControl>
                <FormDescription>
                  This is the title of your sales presentation.
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
                    placeholder="A brief description of the presentation"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A short description to provide context.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>
              Customize how your presentation is displayed.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel className="text-base">Card Columns</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {columnOptions.map((option) => (
                    <FormField
                      key={option.id}
                      control={form.control}
                      name="cardColumns"
                      render={({ field }) => {
                        return (
                          <FormItem
                            className="flex flex-row items-center space-x-2 space-y-0"
                            key={option.id}
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), option.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== option.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormDescription>
                  Select the columns to display on the cards.
                </FormDescription>
                <FormMessage />
              </div>

              <div>
                <FormLabel className="text-base">Dialog Columns</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {columnOptions.map((option) => (
                    <FormField
                      key={option.id}
                      control={form.control}
                      name="dialogColumns"
                      render={({ field }) => (
                        <FormItem
                          className="flex flex-row items-center space-x-2 space-y-0"
                          key={option.id}
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value || []),
                                      option.id,
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== option.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormDescription>
                  Select the columns to display in the dialog.
                </FormDescription>
                <FormMessage />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="defaultView"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default View</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a view" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {viewOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the default view for the presentation.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="text-base">Enabled Views</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {viewOptions.map((option) => (
                    <FormField
                      key={option.id}
                      control={form.control}
                      name="enabledViews"
                      render={({ field }) => (
                        <FormItem
                          className="flex flex-row items-center space-x-2 space-y-0"
                          key={option.id}
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value || []),
                                      option.id,
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== option.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormDescription>
                  Select the views available for the presentation.
                </FormDescription>
                <FormMessage />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="allowViewToggle"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Allow View Toggle</FormLabel>
                      <FormDescription>
                        Enable users to switch between views.
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

              <FormField
                control={form.control}
                name="showProductDetails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Show Product Details</FormLabel>
                      <FormDescription>
                        Enable product details on card click.
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="allowDownload"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Allow Download</FormLabel>
                      <FormDescription>
                        Enable users to download the presentation.
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

              <FormField
                control={form.control}
                name="showPricing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Show Pricing</FormLabel>
                      <FormDescription>Display pricing information.</FormDescription>
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
            </div>

            <FormField
              control={form.control}
              name="cardWidthType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Width Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a width type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cardWidthOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose between responsive or fixed card widths.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.getValues("cardWidthType") === "fixed" && (
              <FormField
                control={form.control}
                name="fixedCardWidth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fixed Card Width (px)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter a width in pixels"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Set a fixed width for the cards in pixels.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="cardGridLayout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Grid Layout</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {["sm", "md", "lg", "xl", "xxl"].map((size) => (
                      <div key={size}>
                        <FormLabel className="text-sm">{size.toUpperCase()}</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            form.setValue(`cardGridLayout.${size}`, value);
                          }}
                          defaultValue={form.getValues(`cardGridLayout.${size}`)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${size}`} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {gridLayoutOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                  <FormDescription>
                    Define the number of columns for different screen sizes.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Presentation"}
        </Button>
      </form>
    </Form>
  );
}
