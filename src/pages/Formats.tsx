import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlusCircle, Pencil, Package, FilterX, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import FormatDialog from "@/components/FormatDialog";
import FormatViewDialog from "@/components/FormatViewDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Format = {
  id: string;
  format_name: string;
  tps: string | null;
  extent: string | null;
  cover_stock_print: string | null;
  internal_stock_print: string | null;
  created_at: string;
  updated_at: string;
};

type FilterOptions = {
  tps: string | null;
  cover_stock_print: string | null;
  internal_stock_print: string | null;
};

const FormatsTable = () => {
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedFormatId, setSelectedFormatId] = useState<string | undefined>(undefined);
  const [viewFormatId, setViewFormatId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    tps: null,
    cover_stock_print: null,
    internal_stock_print: null,
  });
  const [filterOptions, setFilterOptions] = useState<{
    tps: string[];
    cover_stock_print: string[];
    internal_stock_print: string[];
  }>({
    tps: [],
    cover_stock_print: [],
    internal_stock_print: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchFormats = async () => {
    if (!currentOrganization) {
      return [];
    }

    let query = supabase
      .from("formats")
      .select("*")
      .eq("organization_id", currentOrganization.id);

    if (searchQuery) {
      query = query.ilike("format_name", `%${searchQuery}%`);
    }

    if (filters.tps) {
      query = query.eq("tps", filters.tps);
    }
    if (filters.cover_stock_print) {
      query = query.eq("cover_stock_print", filters.cover_stock_print);
    }
    if (filters.internal_stock_print) {
      query = query.eq("internal_stock_print", filters.internal_stock_print);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching formats:", error);
      throw new Error(error.message);
    }

    return data as Format[];
  };

  const { data: formats, isLoading, error, refetch } = useQuery({
    queryKey: ["formats", currentOrganization?.id, searchQuery, filters],
    queryFn: fetchFormats,
    enabled: !!currentOrganization,
  });

  useEffect(() => {
    if (formats && formats.length > 0) {
      const tpsOptions = Array.from(
        new Set(formats.map((format) => format.tps).filter(Boolean))
      ) as string[];
      
      const coverStockOptions = Array.from(
        new Set(formats.map((format) => format.cover_stock_print).filter(Boolean))
      ) as string[];
      
      const internalStockOptions = Array.from(
        new Set(formats.map((format) => format.internal_stock_print).filter(Boolean))
      ) as string[];

      setFilterOptions({
        tps: tpsOptions,
        cover_stock_print: coverStockOptions,
        internal_stock_print: internalStockOptions,
      });
    }
  }, [formats]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load formats: " + (error as Error).message);
    }
  }, [error]);

  const handleViewFormat = (formatId: string) => {
    setViewFormatId(formatId);
    setIsViewDialogOpen(true);
  };

  const handleAddFormat = () => {
    setSelectedFormatId(undefined);
    setIsDialogOpen(true);
  };

  const handleEditFormat = (formatId: string) => {
    setSelectedFormatId(formatId);
    setIsDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    refetch();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const handleFilterChange = (field: keyof FilterOptions, value: string | null) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      tps: null,
      cover_stock_print: null,
      internal_stock_print: null,
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const areFiltersActive = () => {
    return filters.tps !== null || 
           filters.cover_stock_print !== null || 
           filters.internal_stock_print !== null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle>Formats</CardTitle>
            <CardDescription>Manage your print formats</CardDescription>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search formats..."
                className="w-full md:w-[260px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              className="gap-1"
              onClick={toggleFilters}
            >
              Filters {areFiltersActive() && <span className="ml-1 text-xs bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">{Object.values(filters).filter(Boolean).length}</span>}
            </Button>
            <Button className="gap-1" onClick={handleAddFormat}>
              <PlusCircle className="h-4 w-4" />
              Add Format
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filterOptions.tps.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-1 block">TPS</label>
                  <Select 
                    value={filters.tps || ""}
                    onValueChange={(value) => handleFilterChange("tps", value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select TPS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {filterOptions.tps.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {filterOptions.cover_stock_print.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Cover Stock/Print</label>
                  <Select 
                    value={filters.cover_stock_print || ""}
                    onValueChange={(value) => handleFilterChange("cover_stock_print", value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Cover Stock" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {filterOptions.cover_stock_print.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {filterOptions.internal_stock_print.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Internal Stock/Print</label>
                  <Select 
                    value={filters.internal_stock_print || ""}
                    onValueChange={(value) => handleFilterChange("internal_stock_print", value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Internal Stock" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {filterOptions.internal_stock_print.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {areFiltersActive() && (
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  size="sm" 
                  className="gap-1"
                >
                  <FilterX className="h-4 w-4" />
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : formats && formats.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Format Name</TableHead>
                  <TableHead>TPS</TableHead>
                  <TableHead>Extent</TableHead>
                  <TableHead>Cover Stock/Print</TableHead>
                  <TableHead>Internal Stock/Print</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formats.map((format) => (
                  <TableRow 
                    key={format.id}
                    className="cursor-pointer"
                    onClick={() => handleViewFormat(format.id)}
                  >
                    <TableCell className="font-medium">{format.format_name}</TableCell>
                    <TableCell>{format.tps || "N/A"}</TableCell>
                    <TableCell>{format.extent || "N/A"}</TableCell>
                    <TableCell>{format.cover_stock_print || "N/A"}</TableCell>
                    <TableCell>{format.internal_stock_print || "N/A"}</TableCell>
                    <TableCell>{formatDate(format.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewFormat(format.id);
                          }}
                          title="View format"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditFormat(format.id);
                          }}
                          title="Edit format"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 space-y-3">
            <Package className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="text-lg font-medium">No Formats Found</h3>
            <p className="text-sm max-w-md mx-auto">
              {!currentOrganization
                ? "Please select an organization to view formats."
                : "Get started by adding your first format."}
            </p>
            {currentOrganization && (
              <Button className="mt-4 gap-1" onClick={handleAddFormat}>
                <PlusCircle className="h-4 w-4" />
                Add First Format
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <FormatDialog
        open={isDialogOpen}
        formatId={selectedFormatId}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleDialogSuccess}
      />

      <FormatViewDialog
        open={isViewDialogOpen}
        formatId={viewFormatId}
        onOpenChange={setIsViewDialogOpen}
      />
    </Card>
  );
};

const Formats = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Formats</h1>
        <p className="text-gray-600">Manage your print formats and specifications</p>
      </div>

      <FormatsTable />
    </div>
  );
};

export default Formats;
