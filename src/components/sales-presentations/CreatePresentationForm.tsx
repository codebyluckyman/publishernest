
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
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardColumn, DialogColumn, PresentationViewMode, CardWidthType } from '@/types/salesPresentation';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  defaultView: z.enum(['card', 'table', 'carousel', 'kanban'] as const),
  enabledViews: z.array(z.enum(['card', 'table', 'carousel', 'kanban'] as const)).min(1, {
    message: 'At least one view type must be selected',
  }),
  cardColumns: z.array(z.enum([
    'price', 'isbn13', 'publisher', 'publication_date', 'format', 'synopsis'
  ] as const)),
  dialogColumns: z.array(z.enum([
    'price', 'isbn13', 'publisher', 'publication_date', 'format', 'physical_properties', 'carton_dimensions', 'synopsis'
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

const cardColumnOptions = [
  { value: 'price', label: 'Price' },
  { value: 'isbn13', label: 'ISBN' },
  { value: 'publisher', label: 'Publisher' },
  { value: 'publication_date', label: 'Publication Date' },
  { value: 'format', label: 'Format' },
  { value: 'synopsis', label: 'Synopsis' },
];

const dialogColumnOptions = [
  { value: 'price', label: 'Price' },
  { value: 'isbn13', label: 'ISBN' },
  { value: 'publisher', label: 'Publisher' },
  { value: 'publication_date', label: 'Publication Date' },
  { value: 'format', label: 'Format' },
  { value: 'physical_properties', label: 'Physical Properties' },
  { value: 'carton_dimensions', label: 'Carton Dimensions' },
  { value: 'synopsis', label: 'Synopsis' },
];

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
      dialogColumns: ['price', 'isbn13', 'publisher', 'publication_date', 'synopsis'],
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="display">Display Options</TabsTrigger>
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
