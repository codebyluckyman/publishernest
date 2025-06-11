
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { QuoteRequestTable } from "@/components/quotes/QuoteRequestTable";
import { QuoteRequestDialog } from "@/components/quotes/QuoteRequestDialog";
import { QuoteFilters } from "@/components/quotes/QuoteFilters";
import { useQuoteRequests } from "@/hooks/useQuoteRequests";
import { useFormats } from "@/hooks/useFormats";
import { useSuppliers } from "@/hooks/useSuppliers";
import { QuoteRequest } from "@/types/quoteRequest";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

const QuoteRequests = () => {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  
  const { 
    quoteRequests, 
    isLoading, 
    createQuoteRequest, 
    updateQuoteRequest,
    deleteQuoteRequest,
    isCreating,
    isUpdating,
    isDeleting
  } = useQuoteRequests();
  
  const { formats } = useFormats();
  const { suppliers } = useSuppliers();

  const filteredQuoteRequests = useMemo(() => {
    return quoteRequests.filter((request) => {
      const matchesSearch = searchQuery === "" || 
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.reference_id?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      
      const matchesSupplier = supplierFilter === "all" || 
        request.quote_request_suppliers?.some(qrs => qrs.supplier_id === supplierFilter);
      
      const matchesFormat = formatFilter === "all" || 
        request.quote_request_formats?.some(qrf => qrf.format_id === formatFilter);

      return matchesSearch && matchesStatus && matchesSupplier && matchesFormat;
    });
  }, [quoteRequests, searchQuery, statusFilter, supplierFilter, formatFilter]);

  const handleCreateQuoteRequest = async (data: any) => {
    try {
      const newQuoteRequest = await createQuoteRequest(data);
      setShowCreateDialog(false);
      toast.success("Quote request created successfully");
      
      // Navigate to the new quote request detail page
      navigate(`/quote-requests/${newQuoteRequest.id}`);
    } catch (error) {
      console.error("Error creating quote request:", error);
      toast.error("Failed to create quote request");
    }
  };

  const handleUpdateQuoteRequest = async (id: string, data: any) => {
    try {
      await updateQuoteRequest(id, data);
      toast.success("Quote request updated successfully");
    } catch (error) {
      console.error("Error updating quote request:", error);
      toast.error("Failed to update quote request");
    }
  };

  const handleDeleteQuoteRequest = async (id: string) => {
    try {
      await deleteQuoteRequest(id);
      toast.success("Quote request deleted successfully");
    } catch (error) {
      console.error("Error deleting quote request:", error);
      toast.error("Failed to delete quote request");
    }
  };

  const handleStatusChange = async (quoteRequest: QuoteRequest, newStatus: "approved" | "pending" | "declined") => {
    try {
      await updateQuoteRequest(quoteRequest.id, { status: newStatus });
      toast.success(`Quote request ${newStatus} successfully`);
    } catch (error) {
      console.error("Error updating quote request status:", error);
      toast.error(`Failed to ${newStatus} quote request`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quote Requests</h1>
          <p className="text-muted-foreground">
            Manage your printing quote requests and track supplier responses.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Quote Request
        </Button>
      </div>

      <QuoteFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        supplierFilter={supplierFilter}
        onSupplierChange={setSupplierFilter}
        formatFilter={formatFilter}
        onFormatChange={setFormatFilter}
        suppliers={suppliers}
        formats={formats}
      />

      <QuoteRequestTable
        quoteRequests={filteredQuoteRequests}
        isLoading={isLoading}
        onUpdate={handleUpdateQuoteRequest}
        onDelete={handleDeleteQuoteRequest}
        onStatusChange={handleStatusChange}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />

      <QuoteRequestDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateQuoteRequest}
        isSubmitting={isCreating}
      />
    </div>
  );
};

export default QuoteRequests;
