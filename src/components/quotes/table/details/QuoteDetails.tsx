
import React, { useState, useRef } from "react";
import { QuoteRequest } from "@/types/quoteRequest";
import { DetailHeader } from "./DetailHeader";
import { BasicInfo } from "./BasicInfo";
import { FormatAccordion } from "./FormatAccordion";
import { StatusActions } from "./StatusActions";
import { useReactToPrint } from "react-to-print";
import { toast } from "@/components/ui/use-toast";
import { useOrganization } from "@/context/OrganizationContext";
import { generateQuotePDF } from "./PdfGenerator";
import { Button } from "@/components/ui/button";
import { QuoteResponseButton } from "../QuoteResponseButton";
import { FileText, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AttachmentsSection } from "./AttachmentsSection";
import { CostsAndSavingsTabs } from "./CostsAndSavingsTabs";

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
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { currentOrganization } = useOrganization();
  const navigate = useNavigate();
  
  // Log the selectedRequest for debugging
  console.log("Selected Request:", selectedRequest);
  console.log("Required Step Name:", selectedRequest.required_step_name);
  console.log("Required Step ID:", selectedRequest.required_step_id);
  
  // Using the required_step_name field populated in fetchQuoteRequests.ts
  const stepName = selectedRequest.required_step_name || null;
  
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

      <CostsAndSavingsTabs 
        extraCosts={selectedRequest.extra_costs || []} 
        savings={selectedRequest.savings || []} 
      />

      <div className="border rounded-md overflow-hidden">
        <div 
          className="p-4 bg-muted/50 flex justify-between cursor-pointer"
          onClick={() => setIsAttachmentsOpen(!isAttachmentsOpen)}
        >
          <h3 className="text-md font-medium">Attachments</h3>
          <Button variant="ghost" size="icon">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform ${isAttachmentsOpen ? 'rotate-180' : ''}`}
            >
              <path
                d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </Button>
        </div>
        
        {isAttachmentsOpen && (
          <div className="p-4 border-t">
            <AttachmentsSection quoteRequestId={selectedRequest.id} />
          </div>
        )}
      </div>

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
