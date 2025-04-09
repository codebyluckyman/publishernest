import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Eye, Trash2, Filter } from "lucide-react";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { DateFormatter } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { PurchaseOrderStatus } from "@/types/purchaseOrder";
import { Input } from "@/components/ui/input";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePrintRuns } from "@/hooks/usePrintRuns";
import { useSuppliers } from "@/hooks/useSuppliers";
import { SelectFilter, FilterOption } from "@/components/common/SelectFilter";
import { useFilters } from "@/hooks/useFilters";

// Constants for filter values
const FILTER_VALUES = {
  ALL_PRINT_RUNS: "ALL_PRINT_RUNS",
  ALL_SUPPLIERS: "ALL_SUPPLIERS",
  ALL_STATUSES: "ALL_STATUSES"
};

// Filter config
const filterConfig = {
  printRunId: { all: FILTER_VALUES.ALL_PRINT_RUNS, label: "Print Run" },
  supplierId: { all: FILTER_VALUES.ALL_SUPPLIERS, label: "Supplier" },
  status: { all: FILTER_VALUES.ALL_STATUSES, label: "Status" }
};

const PurchaseOrderStatusBadge = ({ status }: { status: PurchaseOrderStatus }) => {
  const colorMap = {
    'draft': 'bg-gray-200 text-gray-800',
    'pending_approval': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-blue-100 text-blue-800',
    'fulfilled': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
  };

  const labelMap = {
    'draft': 'Draft',
    'pending_approval': 'Pending Approval',
    'approved': 'Approved',
    'fulfilled': 'Fulfilled',
    'cancelled': 'Cancelled',
  };

  return (
    <Badge className={colorMap[status]}>
      {labelMap[status]}
    </Badge>
  );
};

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  const { 
    filters, 
    handleFilterChange, 
    resetFilters, 
    areFiltersActive 
  } = useFilters({
    printRunId: FILTER_VALUES.ALL_PRINT_RUNS,
    supplierId: FILTER_VALUES.ALL_SUPPLIERS,
    status: FILTER_VALUES.ALL_STATUSES
  }, filterConfig);

  const { purchaseOrders, isLoading, isError, error, deletePurchaseOrder } = usePurchaseOrders();
  const { printRuns } = usePrintRuns();
  const { suppliers } = useSuppliers();
  
  const filteredPurchaseOrders = purchaseOrders.filter((po) => {
    const matchesSearch = searchTerm === "" || 
      po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (po.notes && po.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPrintRun = filters.printRunId === FILTER_VALUES.ALL_PRINT_RUNS || po.print_run_id === filters.printRunId;
    const matchesSupplier = filters.supplierId === FILTER_VALUES.ALL_SUPPLIERS || po.supplier_id === filters.supplierId;
    const matchesStatus = filters.status === FILTER_VALUES.ALL_STATUSES || po.status === filters.status;
    
    return matchesSearch && matchesPrintRun && matchesSupplier && matchesStatus;
  });

  const { 
    currentData: paginatedPurchaseOrders, 
    currentPage, 
    pageSize, 
    totalPages, 
    nextPage, 
    previousPage,
    goToPage,
    changePageSize
  } = usePagination({ data: filteredPurchaseOrders });

  const handleCreatePurchaseOrder = () => {
    navigate('/purchase-orders/create');
  };

  const handleViewPurchaseOrder = (id: string) => {
    navigate(`/purchase-orders/${id}`);
  };

  const handleDeletePurchaseOrder = (id: string) => {
    if (window.confirm("Are you sure you want to delete this purchase order?")) {
      deletePurchaseOrder(id);
    }
  };

  const printRunOptions: FilterOption[] = [
    { value: FILTER_VALUES.ALL_PRINT_RUNS, label: "All Print Runs" },
    ...printRuns.map((printRun) => ({
      value: printRun.id,
      label: printRun.title
    }))
  ];

  const supplierOptions: FilterOption[] = [
    { value: FILTER_VALUES.ALL_SUPPLIERS, label: "All Suppliers" },
    ...suppliers.map((supplier) => ({
      value: supplier.id,
      label: supplier.supplier_name
    }))
  ];

  const statusOptions: FilterOption[] = [
    { value: FILTER_VALUES.ALL_STATUSES, label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "pending_approval", label: "Pending Approval" },
    { value: "approved", label: "Approved" },
    { value: "fulfilled", label: "Fulfilled" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <Button onClick={handleCreatePurchaseOrder}>
          <Plus className="mr-2 h-4 w-4" /> Create Purchase Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Purchase Orders Management</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFilters}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
              {areFiltersActive() && <Badge className="ml-2 bg-primary">Active</Badge>}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="w-full">
                  <SelectFilter
                    label="Print Run"
                    value={filters.printRunId}
                    onValueChange={(value) => handleFilterChange("printRunId", value)}
                    options={printRunOptions}
                    placeholder="Select Print Run"
                  />
                </div>
                <div className="w-full">
                  <SelectFilter
                    label="Supplier"
                    value={filters.supplierId}
                    onValueChange={(value) => handleFilterChange("supplierId", value)}
                    options={supplierOptions}
                    placeholder="Select Supplier"
                  />
                </div>
                <div className="w-full">
                  <SelectFilter
                    label="Status"
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange("status", value)}
                    options={statusOptions}
                    placeholder="Select Status"
                  />
                </div>
              </div>

              {areFiltersActive() && (
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={resetFilters}
                    size="sm" 
                    className="gap-1"
                  >
                    <Filter className="h-4 w-4" />
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search purchase orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {isError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Error loading purchase orders: {error instanceof Error ? error.message : 'Unknown error'}
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="text-center py-8">Loading purchase orders...</div>
          ) : paginatedPurchaseOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No purchase orders found. Create your first purchase order to get started.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Print Run</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPurchaseOrders.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell className="font-medium">{po.po_number}</TableCell>
                        <TableCell>{po.print_run?.title || "—"}</TableCell>
                        <TableCell>{po.supplier?.supplier_name || "—"}</TableCell>
                        <TableCell>{po.currency} {po.total_amount?.toFixed(2) || "—"}</TableCell>
                        <TableCell>
                          <PurchaseOrderStatusBadge status={po.status} />
                        </TableCell>
                        <TableCell>{po.issue_date ? DateFormatter.format(new Date(po.issue_date)) : "—"}</TableCell>
                        <TableCell>{po.delivery_date ? DateFormatter.format(new Date(po.delivery_date)) : "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewPurchaseOrder(po.id)}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {po.status === 'draft' && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeletePurchaseOrder(po.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
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
                totalItems={filteredPurchaseOrders.length}
                onPageChange={goToPage}
                onPreviousPage={previousPage}
                onNextPage={nextPage}
                onPageSizeChange={changePageSize}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseOrders;
