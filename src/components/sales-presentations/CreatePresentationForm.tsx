
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardColumn, DialogColumn, PresentationViewMode, CardWidthType } from '@/types/salesPresentation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  defaultView: z.enum(['card', 'table', 'carousel', 'kanban'] as const),
  enabledViews: z.array(z.enum(['card', 'table', 'carousel', 'kanban'] as const)).min(1, {
    message: 'At least one view type must be selected',
  }),
  cardColumns: z.array(z.enum([
    // Basic info
    'title', 'isbn13', 'isbn10', 'price',
    // Product details
    'product_form', 'product_form_detail', 'publisher', 'publication_date', 'status',
    // Physical properties - individual
    'height', 'width', 'thickness', 'weight',
    // Physical properties - grouped
    'physical_properties',
    // Format details
    'format', 'format_extras', 'format_extra_comments',
    // Content details
    'page_count', 'edition_number',
    // Carton information - individual
    'carton_quantity', 'carton_dimensions',
    // Additional information
    'synopsis', 'subtitle', 'series_name', 'age_range', 'license',
    // Codes
    'language_code', 'subject_code', 'product_availability_code'
  ] as const)),
  dialogColumns: z.array(z.enum([
    // Basic info
    'title', 'isbn13', 'isbn10', 'price',
    // Product details
    'product_form', 'product_form_detail', 'publisher', 'publication_date', 'status',
    // Physical properties - individual
    'height', 'width', 'thickness', 'weight',
    // Physical properties - grouped
    'physical_properties',
    // Format details
    'format', 'format_extras', 'format_extra_comments',
    // Content details
    'page_count', 'edition_number',
    // Carton information - individual
    'carton_quantity', 'carton_length', 'carton_width', 'carton_height', 'carton_weight',
    // Carton information - grouped
    'carton_dimensions',
    // Additional information
    'synopsis', 'subtitle', 'series_name', 'age_range', 'license',
    // Codes
    'language_code', 'subject_code', 'product_availability_code'
  ] as const)),
  allowViewToggle: z.boolean().default(true),
  showProductDetails: z.boolean().default(true),
  showPricing: z.boolean().default(true),
  allowDownload: z.boolean().default(false),
  cardWidthType: z.enum(['responsive', 'fixed'] as const).default('responsive'),
  fixedCardWidth: z.number().min(200).max(800).optional(),
  cardGridLayout: z.object({
    sm: z.union([z.literal(1), z.literal(2)]).default(1),
    md: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
    lg: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
    xl: z.union([z.literal(3), z.literal(4), z.literal(5)]).default(4),
    xxl: z.union([z.literal(4), z.literal(5), z.literal(6)]).default(5)
  }).optional()
});

type FormValues = z.infer<typeof formSchema>;

const viewTypes = [
  { id: 'card', label: 'Card View' },
  { id: 'table', label: 'Table View' },
  { id: 'carousel', label: 'Carousel View' },
  { id: 'kanban', label: 'Kanban View' },
];

// Group column options into categories for better organization
const columnOptions = {
  'Basic Information': [
    { value: 'title', label: 'Title' },
    { value: 'subtitle', label: 'Subtitle' },
    { value: 'isbn13', label: 'ISBN-13' },
    { value: 'isbn10', label: 'ISBN-10' },
    { value: 'price', label: 'Price' },
    { value: 'publisher', label: 'Publisher' },
    { value: 'publication_date', label: 'Publication Date' },
    { value: 'status', label: 'Status' },
  ],
  'Format Information': [
    { value: 'product_form', label: 'Format Type' },
    { value: 'product_form_detail', label: 'Format Detail' },
    { value: 'format', label: 'Format' },
    { value: 'format_extras', label: 'Format Features' },
    { value: 'format_extra_comments', label: 'Format Comments' },
  ],
  'Physical Properties': [
    { value: 'height', label: 'Height' },
    { value: 'width', label: 'Width' },
    { value: 'thickness', label: 'Thickness' },
    { value: 'weight', label: 'Weight' },
    { value: 'physical_properties', label: 'Dimensions (combined)' },
    { value: 'page_count', label: 'Page Count' },
    { value: 'edition_number', label: 'Edition' },
  ],
  'Carton Information': [
    { value: 'carton_quantity', label: 'Carton Quantity' },
    { value: 'carton_length', label: 'Carton Length' },
    { value: 'carton_width', label: 'Carton Width' },
    { value: 'carton_height', label: 'Carton Height' },
    { value: 'carton_weight', label: 'Carton Weight' },
    { value: 'carton_dimensions', label: 'Carton Dimensions (combined)' },
  ],
  'Additional Information': [
    { value: 'synopsis', label: 'Synopsis' },
    { value: 'series_name', label: 'Series' },
    { value: 'age_range', label: 'Age Range' },
    { value: 'license', label: 'License' },
    { value: 'language_code', label: 'Language Code' },
    { value: 'subject_code', label: 'Subject Code' },
    { value: 'product_availability_code', label: 'Availability Code' },
  ]
};

// Flatten for use in card columns (simpler interface)
const cardColumnOptions = Object.values(columnOptions).flat();

// Full options for dialog
const dialogColumnOptions = Object.values(columnOptions).flat();

interface CreatePresentationFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function CreatePresentationForm({ onSubmit, isSubmitting }: CreatePresentationFormProps) {
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      defaultView: 'card',
      enabledViews: ['card', 'table'],
      cardColumns: ['price', 'isbn13', 'publisher'],
      dialogColumns: ['price', 'isbn13', 'publisher', 'publication_date', 'physical_properties', 'synopsis'],
      allowViewToggle: true,
      showProductDetails: true,
      showPricing: true,
      allowDownload: false,
      cardWidthType: 'responsive',
      cardGridLayout: {
        sm: 1,
        md: 2, 
        lg: 3,
        xl: 4,
        xxl: 5
      }
    },
  });

  const watchDefaultView = form.watch('defaultView');
  const watchEnabledViews = form.watch('enabledViews');
  const watchCardWidthType = form.watch('cardWidthType');
  const watchCardColumns = form.watch('cardColumns');
  const watchDialogColumns = form.watch('dialogColumns');

  const handleSubmit = (values: FormValues) => {
    // If fixed card width is selected but no width is provided, set a default
    if (values.cardWidthType === 'fixed' && !values.fixedCardWidth) {
      values.fixedCardWidth = 320; // Default fixed width
    }
    
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="display">Display Options</TabsTrigger>
            <TabsTrigger value="product-fields">Product Fields</TabsTrigger>
            <TabsTrigger value="card-layout">Card Layout</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter presentation title" {...field} />
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
                      placeholder="Enter presentation description" 
                      {...field} 
                      className="min-h-32"
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a description to help identify this presentation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="display" className="space-y-4 pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">View Options</h3>

              <FormField
                control={form.control}
                name="enabledViews"
                render={() => (
                  <FormItem>
                    <FormLabel>Enabled View Types</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {viewTypes.map((viewType) => (
                        <FormField
                          key={viewType.id}
                          control={form.control}
                          name="enabledViews"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={viewType.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(viewType.id as PresentationViewMode)}
                                    onCheckedChange={(checked) => {
                                      const updatedViews = checked
                                        ? [...field.value, viewType.id as PresentationViewMode]
                                        : field.value?.filter(
                                            (item) => item !== viewType.id
                                          );
                                      field.onChange(updatedViews);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {viewType.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultView"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default View</FormLabel>
                    <Select
                      disabled={watchEnabledViews.length === 0}
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value as PresentationViewMode);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a view type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {watchEnabledViews.map((viewType) => (
                          <SelectItem key={viewType} value={viewType}>
                            {viewTypes.find((vt) => vt.id === viewType)?.label || viewType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The default view when opening the presentation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowViewToggle"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Allow View Switching</FormLabel>
                      <FormDescription>
                        Allows viewers to switch between enabled view types
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showProductDetails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show Product Details</FormLabel>
                      <FormDescription>
                        Allow users to click on products to see more details
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showPricing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show Pricing</FormLabel>
                      <FormDescription>
                        Display product pricing information
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowDownload"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Allow Downloads</FormLabel>
                      <FormDescription>
                        Enables download options for the presentation
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="product-fields" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card Fields Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Card Fields</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select fields to display on product cards
                </p>
                
                <FormField
                  control={form.control}
                  name="cardColumns"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-4">
                        <ScrollArea className="h-[400px] pr-4">
                          <Accordion type="multiple" defaultValue={['BasicInformation']}>
                            {Object.entries(columnOptions).map(([category, options]) => (
                              <AccordionItem key={category} value={category.replace(/\s+/g, '')}>
                                <AccordionTrigger className="text-sm font-medium">
                                  {category}
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    ({options.filter(option => field.value?.includes(option.value as CardColumn)).length} selected)
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-1 gap-2">
                                    {options.map(option => (
                                      <FormItem
                                        key={option.value}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(option.value as CardColumn)}
                                            onCheckedChange={(checked) => {
                                              const updatedColumns = checked
                                                ? [...field.value, option.value as CardColumn]
                                                : field.value?.filter(
                                                    (col) => col !== option.value
                                                  );
                                              field.onChange(updatedColumns);
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          {option.label}
                                        </FormLabel>
                                      </FormItem>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </ScrollArea>
                        <FormDescription>
                          Selected fields: {watchCardColumns.length}
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Dialog Fields Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Detail View Fields</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select fields to display in product detail dialog
                </p>
                
                <FormField
                  control={form.control}
                  name="dialogColumns"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-4">
                        <ScrollArea className="h-[400px] pr-4">
                          <Accordion type="multiple" defaultValue={['BasicInformation']}>
                            {Object.entries(columnOptions).map(([category, options]) => (
                              <AccordionItem key={category} value={category.replace(/\s+/g, '')}>
                                <AccordionTrigger className="text-sm font-medium">
                                  {category}
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    ({options.filter(option => field.value?.includes(option.value as DialogColumn)).length} selected)
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-1 gap-2">
                                    {options.map(option => (
                                      <FormItem
                                        key={option.value}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(option.value as DialogColumn)}
                                            onCheckedChange={(checked) => {
                                              const updatedColumns = checked
                                                ? [...field.value, option.value as DialogColumn]
                                                : field.value?.filter(
                                                    (col) => col !== option.value
                                                  );
                                              field.onChange(updatedColumns);
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          {option.label}
                                        </FormLabel>
                                      </FormItem>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </ScrollArea>
                        <FormDescription>
                          Selected fields: {watchDialogColumns.length}
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Field Preview */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Card Preview</h3>
              <div className="bg-muted/30 border rounded-lg p-4">
                <Card className="w-[300px]">
                  <div className="h-36 bg-muted/50 flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">Product Image</p>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="text-lg font-medium">Product Title</div>
                    {watchCardColumns.includes('subtitle') && (
                      <div className="text-sm text-muted-foreground">Product Subtitle</div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {watchCardColumns
                      .filter(col => col !== 'title' && col !== 'subtitle')
                      .slice(0, 5)
                      .map(col => (
                        <div key={col} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {cardColumnOptions.find(opt => opt.value === col)?.label || col}:
                          </span>
                          <span className="font-medium">Example value</span>
                        </div>
                      ))}
                    {watchCardColumns.length > 7 && (
                      <div className="text-xs text-center text-muted-foreground">+ {watchCardColumns.length - 7} more fields</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="card-layout" className="space-y-6 pt-4">
            {/* Card Width Type Selection */}
            <FormField
              control={form.control}
              name="cardWidthType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Card Width Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value as CardWidthType)}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="responsive" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Responsive (adapts to screen size)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="fixed" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Fixed Width (specify exact width)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fixed Card Width Input - Only shown when fixed width is selected */}
            {watchCardWidthType === 'fixed' && (
              <FormField
                control={form.control}
                name="fixedCardWidth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Width (pixels)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={200}
                        max={800}
                        placeholder="320"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Recommended: 300-500 pixels. Cards will have exactly this width.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Only show grid layout controls for responsive mode */}
            {watchCardWidthType === 'responsive' && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Responsive Grid Configuration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure how many cards appear per row at different screen sizes
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="cardGridLayout.sm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Small screens (≤640px)</FormLabel>
                        <Select 
                          value={field.value?.toString()} 
                          onValueChange={(value) => {
                            const numValue = parseInt(value);
                            if (numValue === 1 || numValue === 2) {
                              field.onChange(numValue);
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="1 column" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 column</SelectItem>
                            <SelectItem value="2">2 columns</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Mobile devices
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cardGridLayout.md"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medium screens (≥768px)</FormLabel>
                        <Select 
                          value={field.value?.toString()} 
                          onValueChange={(value) => {
                            const numValue = parseInt(value);
                            if (numValue === 1 || numValue === 2 || numValue === 3) {
                              field.onChange(numValue);
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="2 columns" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 column</SelectItem>
                            <SelectItem value="2">2 columns</SelectItem>
                            <SelectItem value="3">3 columns</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Tablets
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cardGridLayout.lg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Large screens (≥1024px)</FormLabel>
                        <Select 
                          value={field.value?.toString()} 
                          onValueChange={(value) => {
                            const numValue = parseInt(value);
                            if (numValue === 2 || numValue === 3 || numValue === 4) {
                              field.onChange(numValue);
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="3 columns" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="2">2 columns</SelectItem>
                            <SelectItem value="3">3 columns</SelectItem>
                            <SelectItem value="4">4 columns</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Laptops
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cardGridLayout.xl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>X-Large screens (≥1280px)</FormLabel>
                        <Select 
                          value={field.value?.toString()} 
                          onValueChange={(value) => {
                            const numValue = parseInt(value);
                            if (numValue === 3 || numValue === 4 || numValue === 5) {
                              field.onChange(numValue);
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="4 columns" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="3">3 columns</SelectItem>
                            <SelectItem value="4">4 columns</SelectItem>
                            <SelectItem value="5">5 columns</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Desktops
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cardGridLayout.xxl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>XX-Large screens (≥1536px)</FormLabel>
                        <Select 
                          value={field.value?.toString()} 
                          onValueChange={(value) => {
                            const numValue = parseInt(value);
                            if (numValue === 4 || numValue === 5 || numValue === 6) {
                              field.onChange(numValue);
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="5 columns" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="4">4 columns</SelectItem>
                            <SelectItem value="5">5 columns</SelectItem>
                            <SelectItem value="6">6 columns</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Large desktops
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Preview section - shows for both fixed and responsive modes */}
            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Preview</h4>
              <div className="bg-muted/30 border rounded-lg p-4">
                {watchCardWidthType === 'fixed' ? (
                  <div className="flex flex-wrap gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="bg-muted h-16 rounded flex items-center justify-center text-xs text-muted-foreground"
                        style={{ 
                          width: form.watch('fixedCardWidth') ? `${form.watch('fixedCardWidth')}px` : '320px',
                          flexShrink: 0
                        }}
                      >
                        Fixed width card
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="bg-muted h-16 rounded flex items-center justify-center text-xs text-muted-foreground">
                        Responsive card
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Resize your browser to see how the layout adapts to different screen sizes
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Presentation'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
