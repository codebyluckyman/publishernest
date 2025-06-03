
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { usePrintRuns } from "@/hooks/usePrintRuns";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { PrintRun, PrintRunStatus } from "@/types/printRun";
import { Input } from "@/components/ui/input";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SelectFilter, FilterOption } from "@/components/common/SelectFilter";
import { debounce } from "lodash";

export const FILTER_VALUES = {
  ALL_STATUSES: "ALL_STATUSES",
};

const PrintRunDialog = ({
  printRun,
  onSave,
  open,
  onOpenChange,
}: {
  printRun?: PrintRun;
  onSave: (data: {
    title: string;
    description: string;
    status: PrintRunStatus;
  }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [title, setTitle] = useState(printRun?.title || "");
  const [description, setDescription] = useState(printRun?.description || "");
  const [status, setStatus] = useState<PrintRunStatus>(
    printRun?.status || "draft"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, status });
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {printRun ? "Edit Print Run" : "Create Print Run"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium block">Title</label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter print run title"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium block">Description</label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter print run description"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium block">Status</label>
          <SelectFilter
            value={status}
            onValueChange={(value) => setStatus(value as PrintRunStatus)}
            options={[
              { value: "draft", label: "Draft" },
              { value: "in_progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
            ]}
            placeholder="Select status"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit">{printRun ? "Update" : "Create"}</Button>
        </div>
      </form>
    </DialogContent>
  );
};

const PrintRunStatusBadge = ({ status }: { status: PrintRunStatus }) => {
  const colorMap = {
    draft: "bg-gray-200 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  const labelMap = {
    draft: "Draft",
    in_progress: "In Progress",
    completed: "Completed",
  };

  return <Badge className={colorMap[status]}>{labelMap[status]}</Badge>;
};

const PrintRuns = () => {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState(searchTerm);

  const [statusFilter, setStatusFilter] = useState<string>(
    FILTER_VALUES.ALL_STATUSES
  );

  const {
    printRuns,
    isLoading,
    isError,
    error,
    createPrintRun,
    updatePrintRun,
    deletePrintRun,
  } = usePrintRuns();

  const [selectedPrintRun, setSelectedPrintRun] = useState<
    PrintRun | undefined
  >(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredPrintRuns = printRuns.filter((printRun) => {
    const matchesSearch =
      searchTerm === "" ||
      printRun.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (printRun.description &&
        printRun.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === FILTER_VALUES.ALL_STATUSES ||
      printRun.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const {
    currentData: paginatedPrintRuns,
    currentPage,
    pageSize,
    totalPages,
    nextPage,
    previousPage,
    goToPage,
    changePageSize,
  } = usePagination({ data: filteredPrintRuns });

  const handleCreatePrintRun = (data: {
    title: string;
    description: string;
    status: PrintRunStatus;
  }) => {
    if (!currentOrganization || !user) return;

    createPrintRun({
      title: data.title,
      description: data.description,
      organizationId: currentOrganization.id,
      createdBy: user.id,
      status: data.status,
    });
  };

  const handleUpdatePrintRun = (data: {
    title: string;
    description: string;
    status: PrintRunStatus;
  }) => {
    if (!selectedPrintRun) return;

    updatePrintRun({
      id: selectedPrintRun.id,
      title: data.title,
      description: data.description,
      status: data.status,
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

  const statusOptions: FilterOption[] = [
    { value: FILTER_VALUES.ALL_STATUSES, label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  const debouncedSetSearchQuery = useMemo(
    () => debounce((query: string) => setSearchTerm(query), 500),
    [setSearchTerm]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetSearchQuery(value);
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
                value={inputValue}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-1/3">
              <SelectFilter
                value={statusFilter}
                onValueChange={setStatusFilter}
                options={statusOptions}
                placeholder="Filter by status"
              />
            </div>
          </div>

          {isError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Error loading print runs:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
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
                        <TableCell className="font-medium">
                          {printRun.title}
                        </TableCell>
                        <TableCell>{printRun.description || "—"}</TableCell>
                        <TableCell>
                          <PrintRunStatusBadge status={printRun.status} />
                        </TableCell>
                        <TableCell>
                          {formatDate(printRun.created_at)}
                        </TableCell>
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

              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredPrintRuns.length}
                onPageChange={goToPage}
                onPreviousPage={previousPage}
                onNextPage={nextPage}
                onPageSizeChange={changePageSize}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <PrintRunDialog
          printRun={selectedPrintRun}
          onSave={
            selectedPrintRun ? handleUpdatePrintRun : handleCreatePrintRun
          }
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </Dialog>
    </div>
  );
};

export default PrintRuns;
