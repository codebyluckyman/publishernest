
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination } from "@/hooks/usePagination";
import { PurchaseOrderStatusBadge } from "@/components/purchase-orders/PurchaseOrderStatusBadge";
import { PurchaseOrderStatusFilter } from "@/components/purchase-orders/PurchaseOrderStatusFilter";
import { SortableTableHeader } from "@/components/common/SortableTableHeader";
import { PurchaseOrderSortField, SortConfig } from "@/types/sorting";

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Sort state management
  const [sortConfig, setSortConfig] = useState<SortConfig<PurchaseOrderSortField>>({
    field: 'po_number',
    direction: 'asc'
  });
  
  // Pass status code filter if not "all"
  const { purchaseOrders, isLoading } = usePurchaseOrders({
    statusCode: statusFilter !== "all" ? statusFilter : undefined
  });
  
  // Filter and sort the purchase orders
  const filteredAndSortedPurchaseOrders = useMemo(() => {
    if (!purchaseOrders.length) return [];

    // First filter by search query
    let filtered = purchaseOrders.filter(po => {
      const matchesSearch = !searchQuery || 
        po.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (po.supplier?.supplier_name || "").toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });

    // Then sort the filtered data
    return filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.field) {
        case 'po_number':
          aValue = a.po_number;
          bValue = b.po_number;
          break;
        case 'supplier_name':
          aValue = a.supplier?.supplier_name || '';
          bValue = b.supplier?.supplier_name || '';
          break;
        case 'status_code':
          aValue = a.status_code;
          bValue = b.status_code;
          break;
        case 'issue_date':
          aValue = a.issue_date ? new Date(a.issue_date) : new Date(0);
          bValue = b.issue_date ? new Date(b.issue_date) : new Date(0);
          break;
        case 'delivery_date':
          aValue = a.delivery_date ? new Date(a.delivery_date) : new Date(0);
          bValue = b.delivery_date ? new Date(b.delivery_date) : new Date(0);
          break;
        case 'total_amount':
          aValue = a.total_amount || 0;
          bValue = b.total_amount || 0;
          break;
        default:
          return 0;
      }

      // Handle date comparison
      if (sortConfig.field === 'issue_date' || sortConfig.field === 'delivery_date') {
        const comparison = aValue.getTime() - bValue.getTime();
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      // Handle numeric comparison
      if (sortConfig.field === 'total_amount') {
        const comparison = aValue - bValue;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      // Handle string comparison
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      const comparison = aValue.toString().toLowerCase().localeCompare(bValue.toString().toLowerCase());
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [purchaseOrders, sortConfig, searchQuery]);
  
  // Set up pagination
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    currentData: paginatedPurchaseOrders,
    goToPage,
    nextPage,
    previousPage,
    changePageSize
  } = usePagination({
    data: filteredAndSortedPurchaseOrders,
    initialPageSize: 10
  });

  const handleSort = (field: PurchaseOrderSortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const handleCreatePurchaseOrder = () => {
    navigate("/purchase-orders/create");
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString();
  };
  
  const formatCurrency = (amount?: number, currency = 'USD') => {
    if (amount === undefined || amount === null) return "—";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage your purchase orders and supplier relationships</p>
        </div>
        <Button onClick={handleCreatePurchaseOrder}>
          <Plus className="mr-2 h-4 w-4" />
          Create Purchase Order
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by PO number or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <PurchaseOrderStatusFilter 
          value={statusFilter}
          onValueChange={setStatusFilter}
        />
      </div>

      {/* Purchase Orders Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHeader
                field="po_number"
                label="PO Number"
                currentSortField={sortConfig.field}
                sortDirection={sortConfig.direction}
                onSort={handleSort}
              />
              <SortableTableHeader
                field="supplier_name"
                label="Supplier"
                currentSortField={sortConfig.field}
                sortDirection={sortConfig.direction}
                onSort={handleSort}
              />
              <SortableTableHeader
                field="issue_date"
                label="Issue Date"
                currentSortField={sortConfig.field}
                sortDirection={sortConfig.direction}
                onSort={handleSort}
              />
              <SortableTableHeader
                field="delivery_date"
                label="Delivery Date"
                currentSortField={sortConfig.field}
                sortDirection={sortConfig.direction}
                onSort={handleSort}
              />
              <SortableTableHeader
                field="total_amount"
                label="Total Amount"
                currentSortField={sortConfig.field}
                sortDirection={sortConfig.direction}
                onSort={handleSort}
              />
              <SortableTableHeader
                field="status_code"
                label="Status"
                currentSortField={sortConfig.field}
                sortDirection={sortConfig.direction}
                onSort={handleSort}
              />
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : paginatedPurchaseOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No purchase orders found
                </TableCell>
              </TableRow>
            ) : (
              paginatedPurchaseOrders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto font-medium text-primary"
                      onClick={() => navigate(`/purchase-orders/${po.id}`)}
                    >
                      {po.po_number}
                    </Button>
                  </TableCell>
                  <TableCell>{po.supplier?.supplier_name || '—'}</TableCell>
                  <TableCell>{formatDate(po.issue_date)}</TableCell>
                  <TableCell>{formatDate(po.delivery_date)}</TableCell>
                  <TableCell>{formatCurrency(po.total_amount, po.currency)}</TableCell>
                  <TableCell>
                    <PurchaseOrderStatusBadge status={po.status_code} />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/purchase-orders/${po.id}`)}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={goToPage}
        onPreviousPage={previousPage}
        onNextPage={nextPage}
        onPageSizeChange={changePageSize}
      />
    </div>
  );
};

export default PurchaseOrders;
