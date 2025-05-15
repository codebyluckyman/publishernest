
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductWithFormat } from "@/hooks/useProductsWithFormats";
import { PresentationDisplaySettings } from "@/types/salesPresentation";
import { formatPrice } from "@/utils/productUtils";
import Image from "@/components/ui/img";
import { Separator } from "@/components/ui/separator";

interface ProductDetailsDialogProps {
  product: ProductWithFormat;
  customPrice?: number;
  customDescription?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displaySettings?: PresentationDisplaySettings;
}

export function ProductDetailsDialog({
  product,
  customPrice,
  customDescription,
  open,
  onOpenChange,
  displaySettings,
}: ProductDetailsDialogProps) {
  const dialogColumns = displaySettings?.dialogColumns || [
    "price",
    "isbn13",
    "publisher",
    "publication_date",
    "format_name",
    "extent",
    "binding_type",
    "synopsis",
  ];

  const showPricing = displaySettings?.features?.showPricing !== false;

  const getDisplayValue = (column: string) => {
    switch (column) {
      // Basic info
      case "price":
        if (!showPricing) return "Contact for pricing";
        return customPrice !== undefined
          ? formatPrice(customPrice, product.default_currency)
          : formatPrice(product.list_price, product.default_currency);
      case "isbn13":
        return product.isbn13 || "N/A";
      case "isbn10":
        return product.isbn10 || "N/A";

      // Product details
      case "publisher":
        return product.publisher_name || "N/A";
      case "publication_date":
        return product.publication_date
          ? new Date(product.publication_date).toLocaleDateString()
          : "N/A";
      case "product_form":
        return product.product_form || "N/A";
      case "product_form_detail":
        return product.product_form_detail || "N/A";
      case "status":
        return product.status || "N/A";

      // Physical properties
      case "height":
        return product.height_measurement
          ? `${product.height_measurement} mm`
          : "N/A";
      case "width":
        return product.width_measurement
          ? `${product.width_measurement} mm`
          : "N/A";
      case "thickness":
        return product.thickness_measurement
          ? `${product.thickness_measurement} mm`
          : "N/A";
      case "weight":
        return product.weight_measurement
          ? `${product.weight_measurement} g`
          : "N/A";
      case "physical_properties":
        return `H: ${product.height_measurement || "-"}mm × W: ${
          product.width_measurement || "-"
        }mm × T: ${product.thickness_measurement || "-"}mm`;

      // Format details
      case "format":
        return product.format?.id || "N/A";
      case "format_name":
        return product.format?.format_name || "N/A";
      case "binding_type":
        return product.format?.binding_type || "N/A";
      case "cover_material":
        return product.format?.cover_material || "N/A";
      case "internal_material":
        return product.format?.internal_material || "N/A";
      case "cover_stock_print":
        return product.format?.cover_stock_print || "N/A";
      case "internal_stock_print":
        return product.format?.internal_stock_print || "N/A";
      case "orientation":
        return product.format?.orientation || "N/A";
      case "extent":
        return product.format?.extent || "N/A";
      case "tps_dimensions":
        return product.format?.tps_height_mm && product.format?.tps_width_mm
          ? `H: ${product.format.tps_height_mm}mm × W: ${
              product.format.tps_width_mm
            }mm${
              product.format.tps_depth_mm
                ? ` × D: ${product.format.tps_depth_mm}mm`
                : ""
            }`
          : "N/A";
      case "plc_dimensions":
        return product.format?.tps_plc_height_mm &&
          product.format?.tps_plc_width_mm
          ? `H: ${product.format.tps_plc_height_mm}mm × W: ${
              product.format.tps_plc_width_mm
            }mm${
              product.format.tps_plc_depth_mm
                ? ` × D: ${product.format.tps_plc_depth_mm}mm`
                : ""
            }`
          : "N/A";

      case "format_extras":
        if (product.format_extras && typeof product.format_extras === "object") {
          if (Array.isArray(product.format_extras)) {
            return product.format_extras.map(e => e.name).join(", ") || "None";
          }
          const extras = Object.entries(product.format_extras)
            .filter(([_, value]) => value === true)
            .map(([key]) => key.replace("_", " "));
          return extras.length > 0 ? extras.join(", ") : "None";
        }
        return "N/A";

      case "format_extra_comments":
        return product.format_extra_comments || "N/A";

      // Content details
      case "page_count":
        return product.page_count ? `${product.page_count}` : "N/A";
      case "edition_number":
        return product.edition_number ? `${product.edition_number}` : "N/A";

      // Carton information
      case "carton_quantity":
        return product.carton_quantity ? `${product.carton_quantity}` : "N/A";
      case "carton_dimensions":
        if (
          product.carton_length_mm ||
          product.carton_width_mm ||
          product.carton_height_mm
        ) {
          return `L: ${product.carton_length_mm || "-"}mm × W: ${
            product.carton_width_mm || "-"
          }mm × H: ${product.carton_height_mm || "-"}mm`;
        }
        return "N/A";

      // Additional information
      case "synopsis":
        return product.synopsis || "N/A";
      case "subtitle":
        return product.subtitle || "N/A";
      case "series_name":
        return product.series_name || "N/A";
      case "age_range":
        return product.age_range || "N/A";
      case "license":
        return product.license || "N/A";

      // Codes
      case "language_code":
        return product.language_code || "N/A";
      case "subject_code":
        return product.subject_code || "N/A";
      case "product_availability_code":
        return product.product_availability_code || "N/A";

      default:
        return "N/A";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.title}</DialogTitle>
          {product.subtitle && (
            <p className="text-muted-foreground">{product.subtitle}</p>
          )}
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="md:col-span-1 flex justify-center">
            {product.cover_image_url ? (
              <div className="w-40 h-56 overflow-hidden rounded border">
                <Image
                  src={product.cover_image_url}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-40 h-56 bg-muted rounded flex items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>
          <div className="md:col-span-2 space-y-4">
            {customDescription ? (
              <div>
                <h3 className="text-lg font-medium">Description</h3>
                <p>{customDescription}</p>
              </div>
            ) : product.synopsis ? (
              <div>
                <h3 className="text-lg font-medium">Synopsis</h3>
                <p>{product.synopsis}</p>
              </div>
            ) : null}

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Details</h3>
              <Separator />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {dialogColumns.filter(col => col !== "synopsis").map((column) => (
                  <div key={column} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, " ")}:
                    </span>
                    <span className="font-medium">{getDisplayValue(column)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
