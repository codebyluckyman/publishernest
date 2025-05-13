
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
  FormDescription,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { CardGridLayout, PresentationViewMode } from '@/types/salesPresentation';

// Available column options
const cardColumnOptions = [
  { id: 'price', label: 'Price' },
  { id: 'isbn13', label: 'ISBN-13' },
  { id: 'publisher', label: 'Publisher' },
  { id: 'publication_date', label: 'Publication Date' },
  { id: 'format', label: 'Format Details' },
] as const;

const dialogColumnOptions = [
  { id: 'price', label: 'Price' },
  { id: 'isbn13', label: 'ISBN-13' },
  { id: 'publisher', label: 'Publisher' },
  { id: 'publication_date', label: 'Publication Date' },
  { id: 'format', label: 'Format Details' },
  { id: 'physical_properties', label: 'Physical Properties' },
  { id: 'carton_dimensions', label: 'Carton Information' },
  { id: 'synopsis', label: 'Synopsis' },
] as const;

const viewModeOptions = [
  { value: 'card', label: 'Card View' },
  { value: 'table', label: 'Table View' },
  { value: 'carousel', label: 'Carousel View' },
  { value: 'kanban', label: 'Kanban View' },
];

// Validation schema with card grid layout
const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  cardColumns: z.array(z.string()).min(1, { message: 'Select at least one column to display on cards' }),
  dialogColumns: z.array(z.string()).min(1, { message: 'Select at least one column to display in details' }),
  defaultView: z.enum(['card', 'table', 'carousel', 'kanban']).default('card'),
  enabledViews: z.array(z.enum(['card', 'table', 'carousel', 'kanban'])).min(1, { message: 'Select at least one view mode' }),
  allowViewToggle: z.boolean().default(true),
  showProductDetails: z.boolean().default(true),
  allowDownload: z.boolean().default(false),
  showPricing: z.boolean().default(true),
  cardGridLayout: z.object({
    sm: z.enum(['1', '2']).optional(),
    md: z.enum(['1', '2', '3']).optional(),
    lg: z.enum(['2', '3', '4']).optional(),
    xl: z.enum(['3', '4', '5']).optional(),
    xxl: z.enum(['4', '5', '6']).optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreatePresentationFormProps {
  onSubmit: (data: FormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function CreatePresentationForm({ onSubmit, isSubmitting }: CreatePresentationFormProps) {
  const [activeTab, setActiveTab] = useState('card-columns');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      cardColumns: ['price', 'isbn13', 'publisher'],
      dialogColumns: ['price', 'isbn13', 'publisher', 'publication_date', 'synopsis'],
      defaultView: 'card',
      enabledViews: ['card', 'table'],
      allowViewToggle: true,
      showProductDetails: true,
      allowDownload: false,
      showPricing: true,
      cardGridLayout: {
        sm: '1',
        md: '2',
        lg: '3',
        xl: '4',
        xxl: '5'
      }
    },
  });

  const handleSubmit = async (data: FormValues) => {
    // Convert string values to numbers for cardGridLayout
    const processedData = {
      ...data,
      cardGridLayout: data.cardGridLayout ? {
        sm: data.cardGridLayout.sm ? Number(data.cardGridLayout.sm) : undefined,
        md: data.cardGridLayout.md ? Number(data.cardGridLayout.md) : undefined,
        lg: data.cardGridLayout.lg ? Number(data.cardGridLayout.lg) : undefined,
        xl: data.cardGridLayout.xl ? Number(data.cardGridLayout.xl) : undefined,
        xxl: data.cardGridLayout.xxl ? Number(data.cardGridLayout.xxl) : undefined,
      } : undefined,
    };
    
    await onSubmit(processedData as any);
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
                name="defaultView"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default View</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select default view" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {viewModeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select how products will be displayed by default in the presentation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Display Settings</FormLabel>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="card-columns">Card Content</TabsTrigger>
                    <TabsTrigger value="card-layout">Card Layout</TabsTrigger>
                    <TabsTrigger value="dialog-columns">Detail View</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="card-columns" className="pt-4">
                    <FormField
                      control={form.control}
                      name="cardColumns"
                      render={() => (
                        <FormItem>
                          <div className="text-sm mb-2 text-muted-foreground">
                            Select columns to display on product cards in the presentation view
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {cardColumnOptions.map((option) => (
                              <FormField
                                key={option.id}
                                control={form.control}
                                name="cardColumns"
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
                  </TabsContent>

                  <TabsContent value="card-layout" className="pt-4">
                    <div className="space-y-6">
                      <div className="text-sm mb-4 text-muted-foreground">
                        Configure how many cards appear per row at different screen sizes
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="cardGridLayout.sm"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Small screens</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Number of columns" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1 column</SelectItem>
                                  <SelectItem value="2">2 columns</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>Mobile (≤640px)</FormDescription>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cardGridLayout.md"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medium screens</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Number of columns" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1 column</SelectItem>
                                  <SelectItem value="2">2 columns</SelectItem>
                                  <SelectItem value="3">3 columns</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>Tablet (≥768px)</FormDescription>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cardGridLayout.lg"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Large screens</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Number of columns" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="2">2 columns</SelectItem>
                                  <SelectItem value="3">3 columns</SelectItem>
                                  <SelectItem value="4">4 columns</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>Laptop (≥1024px)</FormDescription>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cardGridLayout.xl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>X-Large screens</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Number of columns" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="3">3 columns</SelectItem>
                                  <SelectItem value="4">4 columns</SelectItem>
                                  <SelectItem value="5">5 columns</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>Desktop (≥1280px)</FormDescription>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cardGridLayout.xxl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>XX-Large screens</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Number of columns" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="4">4 columns</SelectItem>
                                  <SelectItem value="5">5 columns</SelectItem>
                                  <SelectItem value="6">6 columns</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>Large Desktop (≥1536px)</FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="dialog-columns" className="pt-4">
                    <FormField
                      control={form.control}
                      name="dialogColumns"
                      render={() => (
                        <FormItem>
                          <div className="text-sm mb-2 text-muted-foreground">
                            Select columns to display in product detail dialog
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {dialogColumnOptions.map((option) => (
                              <FormField
                                key={option.id}
                                control={form.control}
                                name="dialogColumns"
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
                  </TabsContent>
                  
                  <TabsContent value="features" className="pt-4 space-y-6">
                    <div>
                      <FormLabel>Available Views</FormLabel>
                      <div className="text-sm mb-2 mt-1 text-muted-foreground">
                        Select which view modes will be available in this presentation
                      </div>
                      <FormField
                        control={form.control}
                        name="enabledViews"
                        render={() => (
                          <FormItem>
                            <div className="grid grid-cols-2 gap-4">
                              {viewModeOptions.map((option) => (
                                <FormField
                                  key={option.value}
                                  control={form.control}
                                  name="enabledViews"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={option.value}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(option.value as PresentationViewMode)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, option.value as PresentationViewMode])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== option.value
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="allowViewToggle"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Allow View Switching</FormLabel>
                              <FormDescription>
                                Allow viewers to switch between available view modes
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="showProductDetails"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Show Product Details</FormLabel>
                              <FormDescription>
                                Allow viewers to open detailed product information
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="showPricing"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Show Prices</FormLabel>
                              <FormDescription>
                                Show product prices in the presentation
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="allowDownload"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Allow Download</FormLabel>
                              <FormDescription>
                                Allow viewers to download the presentation as PDF
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
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
