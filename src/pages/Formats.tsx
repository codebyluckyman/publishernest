import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlusCircle, Pencil, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import FormatDialog from "@/components/FormatDialog";

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

const FormatsTable = () => {
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFormatId, setSelectedFormatId] = useState<string | undefined>(undefined);

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

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching formats:", error);
      throw new Error(error.message);
    }

    return data as Format[];
  };

  const { data: formats, isLoading, error, refetch } = useQuery({
    queryKey: ["formats", currentOrganization?.id, searchQuery],
    queryFn: fetchFormats,
    enabled: !!currentOrganization,
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load formats: " + (error as Error).message);
    }
  }, [error]);

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
            <Button className="gap-1" onClick={handleAddFormat}>
              <PlusCircle className="h-4 w-4" />
              Add Format
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
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formats.map((format) => (
                  <TableRow key={format.id}>
                    <TableCell className="font-medium">{format.format_name}</TableCell>
                    <TableCell>{format.tps || "N/A"}</TableCell>
                    <TableCell>{format.extent || "N/A"}</TableCell>
                    <TableCell>{format.cover_stock_print || "N/A"}</TableCell>
                    <TableCell>{format.internal_stock_print || "N/A"}</TableCell>
                    <TableCell>{formatDate(format.created_at)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditFormat(format.id)}
                        title="Edit format"
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
