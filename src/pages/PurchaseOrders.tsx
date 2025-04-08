
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Eye, Trash2 } from "lucide-react";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { DateFormatter } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { PurchaseOrderStatus } from "@/types/purchaseOrder";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePagination } from "@/hooks/usePagination";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { usePrintRuns } from "@/hooks/usePrintRuns";
import { useSuppliers } from "@/hooks/useSuppliers";

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
  const { currentOrganization } = useOrganization();
  const [searchTerm, setSearchTerm] = useState("");
  const [printRunFilter, setPrintRunFilter] = useState<string>("");
  const [supplierFilter, setSupplierFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { purchaseOrders, isLoading, isError, error, deletePurchaseOrder } = usePurchaseOrders();
  const { printRuns } = usePrintRuns();
  const { suppliers } = useSuppliers();
  
  const filteredPurchaseOrders = purchaseOrders.filter((po) => {
    const matchesSearch = searchTerm === "" || 
      po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (po.notes && po.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPrintRun = printRunFilter === "" || po.print_run_id === printRunFilter;
    const matchesSupplier = supplierFilter === "" || po.supplier_id === supplierFilter;
    const matchesStatus = statusFilter === "" || po.status === statusFilter;
    
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
          <CardTitle>Purchase Orders Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-1/3">
              <Input
                placeholder="Search purchase orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-1/6">
              <Select value={printRunFilter} onValueChange={setPrintRunFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Print Run" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Print Runs</SelectItem>
                  {printRuns.map((printRun) => (
                    <SelectItem key={printRun.id} value={printRun.id}>
                      {printRun.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/6">
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Suppliers</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.supplier_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/6">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              
              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, filteredPurchaseOrders.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredPurchaseOrders.length}</span> purchase orders
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
                        <PaginationPrevious onClick={() => previousPage()} aria-disabled={currentPage === 1} />
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
                        <PaginationNext onClick={() => nextPage()} aria-disabled={currentPage >= totalPages} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseOrders;
