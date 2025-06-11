
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { QuoteRequestTable } from "@/components/quotes/QuoteRequestTable";
import { QuoteRequestDialog } from "@/components/quotes/QuoteRequestDialog";
import QuoteFilters from "@/components/quotes/QuoteFilters";
import { useQuoteRequests } from "@/hooks/useQuoteRequests";
import { useFormats } from "@/hooks/useFormats";
import { useSuppliers } from "@/hooks/useSuppliers";
import { QuoteRequest } from "@/types/quoteRequest";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useOrganization } from "@/hooks/useOrganization";

const QuoteRequests = () => {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const { currentOrganization } = useOrganization();
  
  // Initialize hooks properly
  const { 
    useQuoteRequestsList,
    useCreateQuoteRequest,
    useUpdateQuoteRequest,
    useDeleteQuoteRequest
  } = useQuoteRequests();
  
  // Use the hooks to get the actual data and functions
  const { 
    data: quoteRequests = [], 
    isLoading 
  } = useQuoteRequestsList(currentOrganization, undefined, searchQuery);
  
  const { mutateAsync: createQuoteRequest, isPending: isCreating } = useCreateQuoteRequest();
  const { mutateAsync: updateQuoteRequest, isPending: isUpdating } = useUpdateQuoteRequest();
  const { mutateAsync: deleteQuoteRequest, isPending: isDeleting } = useDeleteQuoteRequest();
  
  const { data: formats = [] } = useFormats();
  const { data: suppliers = [] } = useSuppliers();

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
      if (!currentOrganization?.id) {
        toast.error("No organization selected");
        return;
      }
      
      const newQuoteRequest = await createQuoteRequest({
        formData: data,
        organizationId: currentOrganization.id
      });
      
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
      await updateQuoteRequest({
        id,
        updates: data
      });
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
      await updateQuoteRequest({
        id: quoteRequest.id, 
        updates: { status: newStatus }
      });
      toast.success(`Quote request ${newStatus} successfully`);
    } catch (error) {
      console.error("Error updating quote request status:", error);
      toast.error(`Failed to ${newStatus} quote request`);
    }
  };

  // Convert formats to the expected format for the filter component
  const formatOptions = formats.map(format => ({
    value: format.id,
    label: format.format_name
  }));
  
  // Convert suppliers to the expected format for the filter component
  const supplierOptions = suppliers.map(supplier => ({
    value: supplier.id,
    label: supplier.supplier_name
  }));

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

      <div className="flex gap-2">
        <QuoteFilters
          filterOption="supplier"
          options={supplierOptions}
          value={supplierFilter}
          isLoading={false}
          onChange={setSupplierFilter}
        />
        
        <QuoteFilters
          filterOption="formats"
          options={formatOptions}
          value={formatFilter}
          isLoading={false}
          onChange={setFormatFilter}
        />
      </div>

      <QuoteRequestTable
        quoteRequests={filteredQuoteRequests}
        isLoading={isLoading}
        onEdit={handleUpdateQuoteRequest}
        onDelete={handleDeleteQuoteRequest}
        onStatusChange={handleStatusChange}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />

      <QuoteRequestDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateQuoteRequest}
        isSubmitting={isCreating}
      />
    </div>
  );
};

export default QuoteRequests;
