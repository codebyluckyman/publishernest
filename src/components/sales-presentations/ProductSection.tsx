import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product, Format } from "@/types";
import { PresentationDisplaySettings, CardColumn, CarouselSettings } from "@/types/salesPresentation";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Edit, ChevronDown, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Carousel } from "@/components/ui/carousel"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

// Define default column sets
const defaultCardColumns: CardColumn[] = ['price', 'isbn13', 'publisher'];

// Utility type to represent a product with optional custom price and description
type ProductWithCustomizations = {
  product: Product;
  customPrice?: number;
  customDescription?: string;
};

// Utility type to represent a product with format details
type ProductWithFormat = Product & {
  formats: Format[];
};

// Card View Component
const CardView: React.FC<{
  products: ProductWithCustomizations[];
  onProductClick: (product: Product) => void;
  displayColumns: CardColumn[];
}> = ({ products, onProductClick, displayColumns }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map(({ product, customPrice, customDescription }) => (
        <Card key={product.id} className="bg-card text-card-foreground shadow-sm">
          <CardHeader>
            <CardTitle>{product.title}</CardTitle>
            <CardDescription>{customDescription || product.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {displayColumns.includes('isbn13') && (
              <div className="flex items-center space-x-2">
                <Label>ISBN:</Label>
                <span>{product.isbn13}</span>
              </div>
            )}
            {displayColumns.includes('price') && (
              <div className="flex items-center space-x-2">
                <Label>Price:</Label>
                <span>{formatCurrency(customPrice || product.price, product.currency)}</span>
              </div>
            )}
            {displayColumns.includes('publisher') && (
              <div className="flex items-center space-x-2">
                <Label>Publisher:</Label>
                <span>{product.publisher_name}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button onClick={() => onProductClick(product)}>View Details</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

// Table View Component
const TableView: React.FC<{
  products: ProductWithCustomizations[];
  onProductClick: (product: Product) => void;
  displayColumns: CardColumn[];
}> = ({ products, onProductClick, displayColumns }) => {
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableCaption>A list of products in a table format.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Title</TableHead>
            {displayColumns.includes('isbn13') && <TableHead>ISBN</TableHead>}
            {displayColumns.includes('price') && <TableHead>Price</TableHead>}
            {displayColumns.includes('publisher') && <TableHead>Publisher</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map(({ product, customPrice, customDescription }) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.title}</TableCell>
              {displayColumns.includes('isbn13') && <TableCell>{product.isbn13}</TableCell>}
              {displayColumns.includes('price') && <TableCell>{formatCurrency(customPrice || product.price, product.currency)}</TableCell>}
              {displayColumns.includes('publisher') && <TableCell>{product.publisher_name}</TableCell>}
              <TableCell className="text-right">
                <Button variant="secondary" size="sm" onClick={() => onProductClick(product)}>
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Carousel View Component
const CarouselView: React.FC<{
  products: ProductWithCustomizations[];
  onProductClick: (product: Product) => void;
  carouselSettings?: CarouselSettings;
}> = ({ products, onProductClick, carouselSettings }) => {
  const slidesPerView = carouselSettings?.slidesPerView || { sm: 1, md: 2, lg: 3 };
  const autoplay = carouselSettings?.autoplay || false;
  const autoplayDelay = carouselSettings?.autoplayDelay || 3000;
  const slideHeight = carouselSettings?.slideHeight || 192;
  const showIndicators = carouselSettings?.showIndicators || true;
  const cardLayout = carouselSettings?.cardLayout || 'standard';
  const layoutOptions = carouselSettings?.layoutOptions || {};
  const sectionStyles = carouselSettings?.sectionStyles || {};

  const renderProductCard = (product: Product, customPrice?: number, customDescription?: string) => {
    if (cardLayout === 'product-sheet') {
      return (
        <div className="relative">
          {layoutOptions?.showCover && (
            <AspectRatio ratio={3 / 4}>
              <img
                src={product.cover_image_url}
                alt={product.title}
                className="object-cover rounded-md"
              />
            </AspectRatio>
          )}
          <div className="p-4">
            <h3 className="text-lg font-semibold">{product.title}</h3>
            {layoutOptions?.showSynopsis && (
              <p className="text-sm text-muted-foreground mt-2">{customDescription || product.synopsis}</p>
            )}
            {layoutOptions?.showSpecsTable && (
              <Table className="mt-4">
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">ISBN</TableCell>
                    <TableCell>{product.isbn13}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Price</TableCell>
                    <TableCell>{formatCurrency(customPrice || product.price, product.currency)}</TableCell>
                  </TableRow>
                  {/* Add more product details here */}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      );
    } else {
      // Standard card layout
      return (
        <Card className="bg-card text-card-foreground shadow-sm">
          <CardHeader>
            <CardTitle>{product.title}</CardTitle>
            <CardDescription>{customDescription || product.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Label>ISBN:</Label>
              <span>{product.isbn13}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Label>Price:</Label>
              <span>{formatCurrency(customPrice || product.price, product.currency)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Label>Publisher:</Label>
              <span>{product.publisher_name}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button onClick={() => onProductClick(product)}>View Details</Button>
          </CardFooter>
        </Card>
      );
    }
  };

  return (
    <Carousel
      opts={{
        loop: true,
        slides: {
          perView: slidesPerView,
        },
        autoplay: autoplay ? {
          delay: autoplayDelay,
          pauseOnMouseEnter: true,
        } : false,
      }}
      className="w-full max-w-md"
    >
      {products.map(({ product, customPrice, customDescription }, index) => (
        <Carousel.Item key={index}>
          <div className="p-1.5">
            {renderProductCard(product, customPrice, customDescription)}
          </div>
        </Carousel.Item>
      ))}
      {showIndicators && (
        <Carousel.Navigation className="bottom-4" />
      )}
    </Carousel>
  );
};

// Kanban View Component
const KanbanView: React.FC<{
  products: ProductWithCustomizations[];
  onProductClick: (product: Product) => void;
  groupByField: string;
}> = ({ products, onProductClick, groupByField }) => {
  // Group products by the specified field
  const groupedProducts = useMemo(() => {
    const groups: { [key: string]: ProductWithCustomizations[] } = {};
    products.forEach(item => {
      const groupKey = (item.product as any)[groupByField] || 'Unknown';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    return groups;
  }, [products, groupByField]);

  return (
    <div className="flex flex-wrap gap-4">
      {Object.entries(groupedProducts).map(([group, items]) => (
        <div key={group} className="w-64">
          <h3 className="text-lg font-semibold mb-2">{group}</h3>
          {items.map(({ product, customPrice, customDescription }) => (
            <Card key={product.id} className="mb-2">
              <CardHeader>
                <CardTitle>{product.title}</CardTitle>
                <CardDescription>{customDescription || product.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Price: {formatCurrency(customPrice || product.price, product.currency)}</p>
                {/* Add more details here */}
              </CardContent>
              <CardFooter>
                <Button onClick={() => onProductClick(product)}>View Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
};

// Product Section Component
interface ProductSectionProps {
  sectionId: string;
  presentationId: string;
  items: any[];
  isEditable: boolean;
  displaySettings: PresentationDisplaySettings;
  getSectionItems: (sectionId: string) => {
    data: any;
    isLoading: boolean;
    isError: boolean;
  };
  updateItem: any;
  deleteItem: any;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  sectionId,
  presentationId,
  items,
  isEditable,
  displaySettings,
  getSectionItems,
  updateItem,
  deleteItem
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customPrice, setCustomPrice] = useState<number | undefined>(undefined);
  const [customDescription, setCustomDescription] = useState<string | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { data: sectionItems, isLoading, isError } = getSectionItems(sectionId);

  const viewMode = displaySettings.defaultView || 'card';
  const kanbanGroupByField = displaySettings.features?.kanbanGroupByField || 'publisher_name';

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleEditClick = (itemId: string) => {
    const item = items.find(item => item.id === itemId);
    if (item) {
      setCustomPrice(item.custom_price);
      setCustomDescription(item.description);
      setIsEditMode(true);
      toggleExpanded(itemId);
    }
  };

  const handleSaveClick = async (itemId: string) => {
    try {
      await updateItem.mutateAsync({
        itemId: itemId,
        sectionId: sectionId,
        itemData: {
          custom_price: customPrice,
          description: customDescription
        }
      });
      setIsEditMode(false);
      toast.success('Item updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      try {
        await deleteItem.mutateAsync({
          itemId: itemToDelete,
          sectionId: sectionId
        });
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
        toast.success('Item deleted successfully');
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete item');
      }
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return <Skeleton className="w-[200px] h-[40px]" />
  }

  if (isError) {
    return <p>Error fetching items</p>;
  }

  return (
    <div>
      {/* View Mode Toggle */}
      {displaySettings.features?.allowViewToggle && (
        <Select defaultValue={viewMode}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select View Mode" />
          </SelectTrigger>
          <SelectContent>
            {displaySettings.features?.enabledViews.includes('card') && (
              <SelectItem value="card">Card View</SelectItem>
            )}
            {displaySettings.features?.enabledViews.includes('table') && (
              <SelectItem value="table">Table View</SelectItem>
            )}
            {displaySettings.features?.enabledViews.includes('carousel') && (
              <SelectItem value="carousel">Carousel View</SelectItem>
            )}
            {displaySettings.features?.enabledViews.includes('kanban') && (
              <SelectItem value="kanban">Kanban View</SelectItem>
            )}
          </SelectContent>
        </Select>
      )}

      {/* Product Listing based on View Mode */}
      {viewMode === 'card' && (
        <CardView
          products={items.map(item => ({
            product: item.product as any, // Type assertion to resolve format compatibility
            customPrice: item.custom_price,
            customDescription: item.description,
          }))}
          onProductClick={handleProductClick}
          displayColumns={displaySettings.cardColumns || defaultCardColumns}
        />
      )}

      {viewMode === 'table' && (
        <TableView
          products={items.map(item => ({
            product: item.product as any, // Type assertion to resolve format compatibility
            customPrice: item.custom_price,
            customDescription: item.description,
          }))}
          onProductClick={handleProductClick}
          displayColumns={displaySettings.cardColumns || defaultCardColumns}
        />
      )}

      {viewMode === 'carousel' && (
        <CarouselView
          products={items.map(item => ({
            product: item.product as any, // Type assertion to resolve format compatibility
            customPrice: item.custom_price,
            customDescription: item.description,
          }))}
          onProductClick={handleProductClick}
          carouselSettings={displaySettings.features?.carouselSettings}
        />
      )}

      {viewMode === 'kanban' && (
        <KanbanView
          products={items.map(item => ({
            product: item.product as any, // Type assertion to resolve format compatibility
            customPrice: item.custom_price,
            customDescription: item.description,
          }))}
          onProductClick={handleProductClick}
          groupByField={kanbanGroupByField}
        />
      )}

      {/* Product Detail Dialog */}
      {selectedProduct && (
        <ProductDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          product={selectedProduct}
          displaySettings={displaySettings}
        />
      )}

      {/* Editable Items */}
      {isEditable && (
        <div className="mt-4">
          <h4 className="text-sm font-bold mb-2">Edit Items:</h4>
          {items.map(item => (
            <Card key={item.id} className="mb-4">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>
                  {item.product.title}
                </CardTitle>
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEditClick(item.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(item.id)} className="text-red-600">
                        {/*<Trash2 className="mr-2 h-4 w-4" />*/}
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              {/* Collapsible Edit Form */}
              <CardContent className={cn("grid gap-4", expandedItems.has(item.id) ? "block" : "hidden")}>
                <div className="grid gap-2">
                  <Label htmlFor="customPrice">Custom Price</Label>
                  <Input
                    type="number"
                    id="customPrice"
                    value={customPrice !== undefined ? customPrice.toString() : ''}
                    onChange={(e) => setCustomPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customDescription">Custom Description</Label>
                  <Textarea
                    id="customDescription"
                    value={customDescription || ''}
                    onChange={(e) => setCustomDescription(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => handleSaveClick(item.id)}>Save</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this item?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  displaySettings: PresentationDisplaySettings;
}

const ProductDialog: React.FC<ProductDialogProps> = ({ isOpen, onClose, product, displaySettings }) => {
  if (!isOpen) return null;

  const dialogColumns = displaySettings.dialogColumns || defaultCardColumns;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/50">
      <div className="relative m-auto mt-20 rounded-lg bg-white p-8 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">{product.title}</h2>
        {dialogColumns.includes('isbn13') && (
          <div className="flex items-center space-x-2 mb-2">
            <Label>ISBN:</Label>
            <span>{product.isbn13}</span>
          </div>
        )}
        {dialogColumns.includes('price') && (
          <div className="flex items-center space-x-2 mb-2">
            <Label>Price:</Label>
            <span>{formatCurrency(product.price, product.currency)}</span>
          </div>
        )}
        {dialogColumns.includes('publisher') && (
          <div className="flex items-center space-x-2 mb-2">
            <Label>Publisher:</Label>
            <span>{product.publisher_name}</span>
          </div>
        )}
        {dialogColumns.includes('publication_date') && (
          <div className="flex items-center space-x-2 mb-2">
            <Label>Publication Date:</Label>
            <span>{product.publication_date}</span>
          </div>
        )}
        {dialogColumns.includes('synopsis') && (
          <div className="mb-2">
            <Label>Synopsis:</Label>
            <p>{product.synopsis}</p>
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default ProductSection;
