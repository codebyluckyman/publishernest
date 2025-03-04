import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Box, BookOpen, Search, PlusCircle, Pencil, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import ProductDialog from "@/components/ProductDialog";

type Product = {
  id: string;
  title: string;
  isbn13: string | null;
  isbn10: string | null;
  product_form: string | null;
  publisher_name: string | null;
  publication_date: string | null;
  list_price: number | null;
  created_at: string;
  updated_at: string;
  cover_image_url: string | null;
};

const ProductCategories = () => {
  const productCategories = [
    { name: "Hardcover Books", count: 0, icon: Package, color: "text-emerald-500" },
    { name: "Paperback Books", count: 0, icon: Package, color: "text-blue-500" },
    { name: "Journals", count: 0, icon: Box, color: "text-purple-500" },
    { name: "Custom Publications", count: 0, icon: Box, color: "text-amber-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {productCategories.map((category) => (
        <Card key={category.name} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {category.name}
            </CardTitle>
            <category.icon className={`w-5 h-5 ${category.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{category.count}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ProductsTable = () => {
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);

  const fetchProducts = async () => {
    if (!currentOrganization) {
      return [];
    }

    let query = supabase
      .from("products")
      .select("*")
      .eq("organization_id", currentOrganization.id);

    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      throw new Error(error.message);
    }

    return data as Product[];
  };

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ["products", currentOrganization?.id, searchQuery],
    queryFn: fetchProducts,
    enabled: !!currentOrganization,
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load products: " + (error as Error).message);
    }
  }, [error]);

  const handleAddProduct = () => {
    setSelectedProductId(undefined);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (productId: string) => {
    setSelectedProductId(productId);
    setIsDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    refetch();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getProductFormLabel = (form: string | null) => {
    if (!form) return "N/A";
    
    const formMap: Record<string, string> = {
      "BA": "Book",
      "BB": "Hardcover",
      "BC": "Paperback",
      "JB": "Journal",
      "DG": "Electronic",
      "XA": "Custom",
    };
    
    return formMap[form] || form;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your product catalog</CardDescription>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-9 w-full md:w-[260px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="gap-1" onClick={handleAddProduct}>
              <PlusCircle className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : products && products.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70px]">Cover</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Publisher</TableHead>
                  <TableHead>Pub Date</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-10 h-14 overflow-hidden rounded border bg-muted">
                        {product.cover_image_url ? (
                          <img 
                            src={product.cover_image_url} 
                            alt={`Cover for ${product.title}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <Image className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>{product.isbn13 || product.isbn10 || "N/A"}</TableCell>
                    <TableCell>{getProductFormLabel(product.product_form)}</TableCell>
                    <TableCell>{product.publisher_name || "N/A"}</TableCell>
                    <TableCell>{formatDate(product.publication_date)}</TableCell>
                    <TableCell>{formatPrice(product.list_price)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditProduct(product.id)}
                        title="Edit product"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 space-y-3">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="text-lg font-medium">No Products Found</h3>
            <p className="text-sm max-w-md mx-auto">
              {!currentOrganization
                ? "Please select an organization to view products."
                : "Get started by adding your first product to the catalog."}
            </p>
            {currentOrganization && (
              <Button className="mt-4 gap-1" onClick={handleAddProduct}>
                <PlusCircle className="h-4 w-4" />
                Add First Product
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <ProductDialog
        open={isDialogOpen}
        productId={selectedProductId}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleDialogSuccess}
      />
    </Card>
  );
};

const Products = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Products</h1>
        <p className="text-gray-600">Manage your product catalog and inventory</p>
      </div>

      <ProductCategories />

      <ProductsTable />
    </div>
  );
};

export default Products;
