import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/types/product";
import Image from "@/components/ui/img";
import { formatPrice } from "@/utils/productUtils";
import { PresentationDisplaySettings } from "@/types/salesPresentation";
import { format, parse, isValid } from "date-fns";

interface KanbanViewProps {
  products: Array<{
    product: Product;
    customPrice?: number;
    customDescription?: string;
  }>;
  displaySettings?: PresentationDisplaySettings;
  onSelectProduct: (product: {
    product: Product;
    customPrice?: number;
    customDescription?: string;
  }) => void;
}

export function KanbanView({ products, displaySettings, onSelectProduct }: KanbanViewProps) {
  const features = displaySettings?.features;
  const showPricing = features?.showPricing !== false;
  
  // Get grouping field from settings or use default "publisher_name"
  const groupByField = features?.kanbanGroupByField || 'publisher_name';

  // Group products by the selected field
  const groupedProducts = products.reduce((acc, item) => {
    // Get the value for the grouping field
    let groupValue: string;
    let sortValue: any = null; // Used for chronological sorting
    
    if (groupByField === 'format') {
      // Special handling for format which needs to pull from format object
      groupValue = item.product.format?.format_name || 'No Format';
    } else if (groupByField === 'age_range') {
      groupValue = item.product.age_range || 'Unspecified Age Range';
    } else if (groupByField === 'publication_date') {
      // Format year for better display
      if (item.product.publication_date) {
        const pubDate = new Date(item.product.publication_date);
        groupValue = pubDate.getFullYear().toString();
        sortValue = pubDate.getFullYear();
      } else {
        groupValue = 'No Publication Date';
        sortValue = 9999; // Sort at the end
      }
    } else if (groupByField === 'publication_month_year') {
      // Format as Month Year (e.g., "May 2025")
      if (item.product.publication_date) {
        const pubDate = new Date(item.product.publication_date);
        if (isValid(pubDate)) {
          groupValue = format(pubDate, 'MMMM yyyy');
          sortValue = pubDate.getTime(); // Use timestamp for accurate sorting
        } else {
          groupValue = 'Invalid Date';
          sortValue = Number.MAX_SAFE_INTEGER;
        }
      } else {
        groupValue = 'No Publication Date';
        sortValue = Number.MAX_SAFE_INTEGER; // Sort at the end
      }
    } else if (groupByField === 'product_form') {
      groupValue = item.product.product_form || 'Unspecified Format Type';
    } else if (groupByField === 'status') {
      groupValue = item.product.status || 'Unknown Status';
    } else {
      // Default to publisher_name or get value from product using dynamic property access
      groupValue = (item.product as any)[groupByField] || `Unknown ${groupByField}`;
    }
    
    // Create group key with sort value for chronological sorting
    const groupKey = groupValue;
    
    if (!acc[groupKey]) {
      acc[groupKey] = {
        items: [],
        sortValue: sortValue
      };
    }
    acc[groupKey].items.push(item);
    return acc;
  }, {} as Record<string, { items: typeof products, sortValue: any }>);

  // Helper function to format price display
  const getPrice = (product: Product, customPrice?: number) => {
    if (!showPricing) {
      return 'Contact for pricing';
    }
    
    return customPrice !== undefined ? 
      formatPrice(customPrice, product.default_currency) : 
      product.list_price ? formatPrice(product.list_price, product.default_currency) : 'Price not available';
  };

  // Helper function to get formatted format display
  const getFormatDisplay = (product: Product) => {
    if (product.format && product.format.format_name) {
      return product.format.format_name;
    } else if (product.format_id) {
      return "Format assigned";
    }
    return null; // Return null if no format info available
  };

  // Get display name for the grouping field
  const getGroupDisplayName = (field: string): string => {
    switch(field) {
      case 'publisher_name': return 'Publisher';
      case 'format': return 'Format';
      case 'product_form': return 'Format Type';
      case 'age_range': return 'Age Range';
      case 'publication_date': return 'Publication Year';
      case 'publication_month_year': return 'Publication Month';
      case 'status': return 'Status';
      default: return field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  // Sort groups chronologically if we're dealing with dates
  let sortedGroupKeys = Object.keys(groupedProducts);
  
  if (groupByField === 'publication_date' || groupByField === 'publication_month_year') {
    sortedGroupKeys = sortedGroupKeys.sort((a, b) => {
      const groupA = groupedProducts[a];
      const groupB = groupedProducts[b];
      
      // If sortValues are available, use them for comparison
      if (groupA.sortValue !== null && groupB.sortValue !== null) {
        return groupA.sortValue - groupB.sortValue;
      }
      
      // Fallback to string comparison
      return a.localeCompare(b);
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedGroupKeys.map((groupName) => (
        <div key={groupName} className="border rounded-md p-4">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">
            {getGroupDisplayName(groupByField)}: {groupName}
          </h3>
          <div className="space-y-4">
            {groupedProducts[groupName].items.map((item) => (
              <Card 
                key={item.product.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelectProduct(item)}
              >
                <div className="flex p-3">
                  {item.product.cover_image_url ? (
                    <div className="w-12 h-16 overflow-hidden rounded mr-3">
                      <Image
                        src={item.product.cover_image_url}
                        alt={item.product.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-16 bg-muted rounded flex items-center justify-center mr-3">
                      <span className="text-xs text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium line-clamp-2 text-sm">{item.product.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.product.isbn13 ? `ISBN-13: ${item.product.isbn13}` : 'No ISBN'} 
                      {showPricing ? ` • ${getPrice(item.product, item.customPrice)}` : ''}
                    </p>
                    {item.product.age_range && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Age: {item.product.age_range}
                      </p>
                    )}
                    {getFormatDisplay(item.product) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: {getFormatDisplay(item.product)}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
