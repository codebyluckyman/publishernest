
import React, { useState, useRef } from "react";
import { QuoteRequest } from "@/types/quoteRequest";
import { DetailHeader } from "./DetailHeader";
import { BasicInfo } from "./BasicInfo";
import { FormatAccordion } from "./FormatAccordion";
import { StatusActions } from "./StatusActions";
import { useReactToPrint } from "react-to-print";
import { toast } from "@/components/ui/use-toast";
import { useOrganization } from "@/context/OrganizationContext";
import { CollapsibleSection } from "./CollapsibleSection";
import { generateQuotePDF } from "./PdfGenerator";
import { Button } from "@/components/ui/button";
import { QuoteResponseButton } from "../QuoteResponseButton";
import { FileText, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface QuoteDetailsProps {
  selectedRequest: QuoteRequest;
  onEdit?: (request: QuoteRequest) => void;
  onStatusChange?: (id: string, status: 'approved' | 'declined' | 'pending') => void;
  onShowHistory: () => void;
}

export function QuoteDetails({ 
  selectedRequest, 
  onEdit, 
  onStatusChange, 
  onShowHistory 
}: QuoteDetailsProps) {
  const [isExtraCostsOpen, setIsExtraCostsOpen] = useState(false);
  const [isSavingsOpen, setIsSavingsOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { currentOrganization } = useOrganization();
  const navigate = useNavigate();
  
  // Log the selectedRequest for debugging
  console.log("Selected Request:", selectedRequest);
  console.log("Required Step Name:", selectedRequest.required_step_name);
  console.log("Required Step ID:", selectedRequest.required_step_id);
  
  // Get the step name from the required_step object instead of required_step_name
  const stepName = selectedRequest.required_step?.step_name || null;
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(selectedRequest);
    }
  };

  const handleStatusChange = (status: 'approved' | 'declined' | 'pending') => {
    if (onStatusChange) {
      onStatusChange(selectedRequest.id, status);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Quote Request - ${selectedRequest.title}`,
    onAfterPrint: () => toast({ 
      title: "Print completed", 
      description: "The quote has been sent to the printer or saved as PDF" 
    }),
  });

  const handleGeneratePDF = () => {
    generateQuotePDF(selectedRequest, currentOrganization);
  };

  const handleViewSupplierQuotes = () => {
    navigate(`/quotes?quoteRequestId=${selectedRequest.id}&tab=all`);
  };

  return (
    <div className="space-y-6 py-6" ref={printRef}>
      <DetailHeader 
        request={selectedRequest} 
        onEdit={onEdit ? handleEdit : undefined}
        onShowHistory={onShowHistory}
        onPrint={handleGeneratePDF}
      />

      <BasicInfo request={selectedRequest} />

      {selectedRequest.description && (
        <div>
          <h3 className="text-md font-medium mb-2">Description</h3>
          <p className="text-sm whitespace-pre-wrap">{selectedRequest.description}</p>
        </div>
      )}

      <div className="bg-muted/30 p-4 rounded-md border border-border">
        <div className="flex items-start space-x-3">
          <Calendar className="h-5 w-5 text-primary mt-0.5" />
          <div className="space-y-3 w-full">
            <div>
              <h3 className="text-md font-medium mb-1">Production Schedule</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Requested:</span>
                <Badge 
                  variant={selectedRequest.production_schedule_requested ? "default" : "outline"}
                >
                  {selectedRequest.production_schedule_requested ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
            
            {selectedRequest.production_schedule_requested && selectedRequest.required_step_id && (
              <div className="pl-2 border-l-2 border-muted space-y-2">
                <div>
                  <span className="text-sm font-medium">Required Step:</span>
                  <span className="text-sm ml-2">
                    {stepName || "No step selected"}
                  </span>
                </div>
                
                {selectedRequest.required_step_date && (
                  <div>
                    <span className="text-sm font-medium">Required By:</span>
                    <span className="text-sm ml-2">
                      {format(new Date(selectedRequest.required_step_date), "PPP")}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedRequest.formats && selectedRequest.formats.length > 0 && (
        <div>
          <h3 className="text-md font-medium mb-2">Format & Product Details</h3>
          <FormatAccordion formats={selectedRequest.formats} />
        </div>
      )}

      <CollapsibleSection
        title="Extra Costs"
        isOpen={isExtraCostsOpen}
        onOpenChange={setIsExtraCostsOpen}
        items={selectedRequest.extra_costs || []}
      />
      
      <CollapsibleSection
        title="Savings"
        isOpen={isSavingsOpen}
        onOpenChange={setIsSavingsOpen}
        items={selectedRequest.savings || []}
      />

      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={handleViewSupplierQuotes}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          View Supplier Quotes
        </Button>
        
        <QuoteResponseButton quoteRequest={selectedRequest} />
      </div>

      {onStatusChange && (
        <StatusActions 
          status={selectedRequest.status} 
          onStatusChange={handleStatusChange} 
        />
      )}
    </div>
  );
}
