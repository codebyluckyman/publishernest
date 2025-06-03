
import { useState } from 'react';
import { CardColumn, DialogColumn } from '@/types/salesPresentation';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface EditProductFieldsTabProps {
  cardColumns: CardColumn[];
  setCardColumns: (columns: CardColumn[]) => void;
  dialogColumns: DialogColumn[];
  setDialogColumns: (columns: DialogColumn[]) => void;
}

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
    { value: 'format_name', label: 'Format Name' },
    { value: 'binding_type', label: 'Binding Type' },
    { value: 'cover_material', label: 'Cover Material' },
    { value: 'cover_stock_print', label: 'Cover Stock/Print' },
    { value: 'internal_material', label: 'Internal Material' },
    { value: 'internal_stock_print', label: 'Internal Stock/Print' },
    { value: 'orientation', label: 'Orientation' },
    { value: 'extent', label: 'Extent' },
    { value: 'tps_dimensions', label: 'TPS Dimensions' },
    { value: 'plc_dimensions', label: 'PLC Dimensions' },
    { value: 'format_extras', label: 'Format Features' },
    { value: 'format_extra_comments', label: 'Format Comments' },
    { value: 'product_form', label: 'Format Type' },
    { value: 'product_form_detail', label: 'Format Detail' },
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

export function EditProductFieldsTab({ 
  cardColumns, 
  setCardColumns,
  dialogColumns,
  setDialogColumns
}: EditProductFieldsTabProps) {
  // Track expanded accordion items
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['BasicInformation']);

  const toggleCardColumn = (column: CardColumn, checked: boolean) => {
    if (checked) {
      setCardColumns([...cardColumns, column]);
    } else {
      setCardColumns(cardColumns.filter(col => col !== column));
    }
  };
  
  const toggleDialogColumn = (column: DialogColumn, checked: boolean) => {
    if (checked) {
      setDialogColumns([...dialogColumns, column]);
    } else {
      setDialogColumns(dialogColumns.filter(col => col !== column));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
      {/* Card Fields Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Card Fields</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select fields to display on product cards
        </p>
        
        <ScrollArea className="h-[400px] pr-4">
          <Accordion 
            type="multiple" 
            value={expandedCategories}
            onValueChange={setExpandedCategories}
          >
            {Object.entries(columnOptions).map(([category, options]) => {
              const categoryKey = category.replace(/\s+/g, '');
              const selectedCount = options.filter(option => 
                cardColumns.includes(option.value as CardColumn)
              ).length;
              
              return (
                <AccordionItem key={categoryKey} value={categoryKey}>
                  <AccordionTrigger className="text-sm font-medium">
                    {category}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({selectedCount} selected)
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 gap-2">
                      {options.map(option => (
                        <div
                          key={option.value}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <Checkbox
                            id={`card-${option.value}`}
                            checked={cardColumns.includes(option.value as CardColumn)}
                            onCheckedChange={(checked) => 
                              toggleCardColumn(option.value as CardColumn, !!checked)
                            }
                          />
                          <Label 
                            htmlFor={`card-${option.value}`}
                            className="text-sm font-normal"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>
        <p className="text-sm text-muted-foreground">
          Selected fields: {cardColumns.length}
        </p>
      </div>
      
      {/* Dialog Fields Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Detail View Fields</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select fields to display in product detail dialog
        </p>
        
        <ScrollArea className="h-[400px] pr-4">
          <Accordion 
            type="multiple" 
            value={expandedCategories}
            onValueChange={setExpandedCategories}
          >
            {Object.entries(columnOptions).map(([category, options]) => {
              const categoryKey = category.replace(/\s+/g, '');
              const selectedCount = options.filter(option => 
                dialogColumns.includes(option.value as DialogColumn)
              ).length;
              
              return (
                <AccordionItem key={categoryKey} value={categoryKey}>
                  <AccordionTrigger className="text-sm font-medium">
                    {category}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({selectedCount} selected)
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 gap-2">
                      {options.map(option => (
                        <div
                          key={option.value}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <Checkbox
                            id={`dialog-${option.value}`}
                            checked={dialogColumns.includes(option.value as DialogColumn)}
                            onCheckedChange={(checked) => 
                              toggleDialogColumn(option.value as DialogColumn, !!checked)
                            }
                          />
                          <Label 
                            htmlFor={`dialog-${option.value}`}
                            className="text-sm font-normal"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>
        <p className="text-sm text-muted-foreground">
          Selected fields: {dialogColumns.length}
        </p>
      </div>
      
      {/* Field Preview */}
      <div className="col-span-1 md:col-span-2 mt-6 border-t pt-4">
        <h3 className="text-sm font-medium mb-2">Card Preview</h3>
        <div className="bg-muted/30 border rounded-lg p-4">
          <Card className="w-[320px]">
            <div className="h-36 bg-muted/50 flex items-center justify-center">
              <p className="text-xs text-muted-foreground">Product Image</p>
            </div>
            <CardHeader className="pb-2">
              <div className="text-lg font-medium">Product Title</div>
              {cardColumns.includes('subtitle') && (
                <div className="text-sm text-muted-foreground">Product Subtitle</div>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {cardColumns
                .filter(col => col !== 'title' && col !== 'subtitle')
                .slice(0, 5)
                .map(col => {
                  const option = Object.values(columnOptions)
                    .flat()
                    .find(opt => opt.value === col);
                    
                  return (
                    <div key={col} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {option?.label || col}:
                      </span>
                      <span className="font-medium">Example value</span>
                    </div>
                  );
                })}
              {cardColumns.length > 7 && (
                <div className="text-xs text-center text-muted-foreground">
                  + {cardColumns.length - 7} more fields
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
