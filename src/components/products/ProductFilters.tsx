
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { XCircle } from "lucide-react";

interface ProductFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: {
    product_form: string | null;
    publisher_name: string | null;
    status: string | null;
  };
  setFilters: (filters: {
    product_form: string | null;
    publisher_name: string | null;
    status: string | null;
  }) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const ProductFilters = ({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  showFilters,
  setShowFilters,
}: ProductFiltersProps) => {
  if (!showFilters) return null;

  const handleClearFilters = () => {
    setFilters({
      product_form: null,
      publisher_name: null,
      status: null,
    });
  };

  return (
    <Card className="p-4 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="product-form">Product Form</Label>
          <Select
            value={filters.product_form || ""}
            onValueChange={(value) =>
              setFilters({ ...filters, product_form: value || null })
            }
          >
            <SelectTrigger id="product-form">
              <SelectValue placeholder="All Forms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Forms</SelectItem>
              <SelectItem value="BA">Book</SelectItem>
              <SelectItem value="BB">Hardcover</SelectItem>
              <SelectItem value="BC">Paperback</SelectItem>
              <SelectItem value="JB">Journal</SelectItem>
              <SelectItem value="DG">Electronic</SelectItem>
              <SelectItem value="XA">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="publisher-name">Publisher</Label>
          <Input
            id="publisher-name"
            placeholder="Publisher name"
            value={filters.publisher_name || ""}
            onChange={(e) =>
              setFilters({ ...filters, publisher_name: e.target.value || null })
            }
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status || ""}
            onValueChange={(value) =>
              setFilters({ ...filters, status: value || null })
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="mt-2"
        onClick={handleClearFilters}
      >
        <XCircle className="h-4 w-4 mr-1" />
        Clear Filters
      </Button>
    </Card>
  );
};

export default ProductFilters;
