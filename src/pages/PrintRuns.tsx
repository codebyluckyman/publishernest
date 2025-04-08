
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { usePrintRuns } from "@/hooks/usePrintRuns";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DateFormatter } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { PrintRun, PrintRunStatus } from "@/types/printRun";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePagination } from "@/hooks/usePagination";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const PrintRunDialog = ({
  printRun,
  onSave,
  open,
  onOpenChange,
}: {
  printRun?: PrintRun;
  onSave: (data: { title: string; description: string; status: PrintRunStatus }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [title, setTitle] = useState(printRun?.title || "");
  const [description, setDescription] = useState(printRun?.description || "");
  const [status, setStatus] = useState<PrintRunStatus>(printRun?.status || "draft");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, status });
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{printRun ? "Edit Print Run" : "Create Print Run"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Enter print run title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input 
            id="description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Enter print run description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as PrintRunStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit">
            {printRun ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

const PrintRunStatusBadge = ({ status }: { status: PrintRunStatus }) => {
  const colorMap = {
    'draft': 'bg-gray-200 text-gray-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
  };

  const labelMap = {
    'draft': 'Draft',
    'in_progress': 'In Progress',
    'completed': 'Completed',
  };

  return (
    <Badge className={colorMap[status]}>
      {labelMap[status]}
    </Badge>
  );
};

const PrintRuns = () => {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { printRuns, isLoading, isError, error, createPrintRun, updatePrintRun, deletePrintRun } = usePrintRuns();
  
  const [selectedPrintRun, setSelectedPrintRun] = useState<PrintRun | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter print runs based on search term and status
  const filteredPrintRuns = printRuns.filter((printRun) => {
    const matchesSearch = searchTerm === "" || 
      printRun.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (printRun.description && printRun.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "" || printRun.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Set up pagination
  const { 
    currentData: paginatedPrintRuns, 
    currentPage, 
    pageSize, 
    totalPages, 
    nextPage, 
    previousPage,
    goToPage,
    changePageSize
  } = usePagination({ data: filteredPrintRuns });

  const handleCreatePrintRun = (data: { title: string; description: string; status: PrintRunStatus }) => {
    if (!currentOrganization || !user) return;
    
    createPrintRun({
      title: data.title,
      description: data.description,
      organizationId: currentOrganization.id,
      createdBy: user.id,
      status: data.status
    });
  };

  const handleUpdatePrintRun = (data: { title: string; description: string; status: PrintRunStatus }) => {
    if (!selectedPrintRun) return;
    
    updatePrintRun({
      id: selectedPrintRun.id,
      title: data.title,
      description: data.description,
      status: data.status
    });
  };

  const handleDeletePrintRun = (id: string) => {
    if (window.confirm("Are you sure you want to delete this print run?")) {
      deletePrintRun(id);
    }
  };

  const openCreateDialog = () => {
    setSelectedPrintRun(undefined);
    setIsDialogOpen(true);
  };

  const openEditDialog = (printRun: PrintRun) => {
    setSelectedPrintRun(printRun);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Print Runs</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Create Print Run
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Print Runs Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-2/3">
              <Input
                placeholder="Search print runs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-1/3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Error loading print runs: {error instanceof Error ? error.message : 'Unknown error'}
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="text-center py-8">Loading print runs...</div>
          ) : paginatedPrintRuns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No print runs found. Create your first print run to get started.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPrintRuns.map((printRun) => (
                      <TableRow key={printRun.id}>
                        <TableCell className="font-medium">{printRun.title}</TableCell>
                        <TableCell>{printRun.description || "—"}</TableCell>
                        <TableCell>
                          <PrintRunStatusBadge status={printRun.status} />
                        </TableCell>
                        <TableCell>{DateFormatter.format(new Date(printRun.created_at))}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(printRun)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeletePrintRun(printRun.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination Controls */}
              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, filteredPrintRuns.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredPrintRuns.length}</span> print runs
                </div>
                <div className="space-x-2">
                  <Select value={pageSize.toString()} onValueChange={(value) => changePageSize(Number(value) as 10 | 25 | 50)}>
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClick={previousPage} disabled={currentPage === 1} />
                      </PaginationItem>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink 
                              isActive={currentPage === page}
                              onClick={() => goToPage(page)}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext onClick={nextPage} disabled={currentPage >= totalPages} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <PrintRunDialog
          printRun={selectedPrintRun}
          onSave={selectedPrintRun ? handleUpdatePrintRun : handleCreatePrintRun}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </Dialog>
    </div>
  );
};

export default PrintRuns;
