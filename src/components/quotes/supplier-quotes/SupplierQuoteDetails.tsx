
import React, { useEffect, useState } from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Button } from "@/components/ui/button";
import { CalendarDays, Package, X, Check, AlertTriangle, Book, ChevronDown, ChevronRight } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { fetchProductionSteps } from "@/api/organizations/productionSteps";
import { useOrganization } from "@/context/OrganizationContext";
import { OrganizationProductionStep } from "@/types/organization";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { FormatDetailsPanel } from "./details/FormatDetailsPanel";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface SupplierQuoteDetailsProps {
  quote: SupplierQuote;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export function SupplierQuoteDetails({ 
  quote, 
  onClose, 
  onApprove, 
  onReject 
}: SupplierQuoteDetailsProps) {
  const { currentOrganization } = useOrganization();
  const [productionSteps, setProductionSteps] = useState<OrganizationProductionStep[]>([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [expandedFormats, setExpandedFormats] = useState<Record<string, boolean>>({});
  
  // Fetch production steps when component mounts
  useEffect(() => {
    const getProductionSteps = async () => {
      if (!currentOrganization?.id) return;
      try {
        const steps = await fetchProductionSteps(currentOrganization.id);
        setProductionSteps(steps);
      } catch (error) {
        console.error("Error fetching production steps:", error);
      }
    };
    
    // Only fetch if quote has production_schedule
    if (quote.production_schedule && Object.keys(quote.production_schedule).length > 0) {
      getProductionSteps();
    }
  }, [currentOrganization, quote.production_schedule]);
  
  // Convert schedule to Record<string, string> if it's not already
  const productionSchedule = quote.production_schedule || {};

  // Helper function to determine if a quote can be approved
  const canBeApproved = quote.status === 'submitted';

  const handleRejectConfirm = () => {
    if (onReject) {
      onReject();
    }
    setRejectModalOpen(false);
  };

  const toggleFormatExpand = (formatId: string) => {
    setExpandedFormats(prev => ({
      ...prev,
      [formatId]: !prev[formatId]
    }));
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Status Banner */}
        <div className={`p-3 rounded-md ${getStatusBackgroundColor(quote.status)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(quote.status)}
              <span className="font-medium">{getStatusText(quote.status)}</span>
            </div>
            <Badge variant={getStatusBadgeVariant(quote.status)}>
              {quote.status.toUpperCase()}
            </Badge>
          </div>
        </div>
        
        {/* Quote details content */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Supplier</p>
              <p className="font-medium">{quote.supplier?.supplier_name || "Unknown supplier"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(quote.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reference</p>
              <p className="font-medium">{quote.reference || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Currency</p>
              <p className="font-medium">{quote.currency || "USD"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="font-medium">{
                quote.total_cost 
                  ? formatCurrency(quote.total_cost, quote.currency) 
                  : "Not specified"
              }</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valid Until</p>
              <p className="font-medium">{quote.valid_to ? formatDate(quote.valid_to) : "Not specified"}</p>
            </div>
            {quote.submitted_at && (
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="font-medium">{formatDate(quote.submitted_at)}</p>
              </div>
            )}
            {quote.approved_at && (
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="font-medium">{formatDate(quote.approved_at)}</p>
              </div>
            )}
            {quote.rejected_at && (
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="font-medium">{formatDate(quote.rejected_at)}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Rejection reason */}
        {quote.rejection_reason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm font-semibold text-red-800">Rejection reason:</p>
            <p className="text-sm text-red-700">{quote.rejection_reason}</p>
          </div>
        )}
        
        {/* Enhanced Formats Section */}
        {quote.formats && quote.formats.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" /> 
              Formats
            </h3>
            <div className="space-y-2">
              {quote.formats.map((format) => (
                <Collapsible 
                  key={format.id} 
                  open={!!expandedFormats[format.id]} 
                  onOpenChange={(open) => toggleFormatExpand(format.id)}
                  className="border rounded-md overflow-hidden"
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{format.format_name}</span>
                        <Badge variant="outline" className="font-normal">
                          ID: {format.format_id.substring(0, 8)}
                        </Badge>
                      </div>
                      {expandedFormats[format.id] ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-3 pt-0 border-t">
                      <FormatDetailsPanel format={format} expanded={true} />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        )}

        <Separator />
        
        {/* Production Schedule */}
        {productionSchedule && Object.keys(productionSchedule).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <CalendarDays className="h-5 w-5 mr-2" /> Production Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productionSteps.map(step => {
                const stepDate = productionSchedule[step.id];
                if (!stepDate) return null;
                
                return (
                  <div key={step.id}>
                    <p className="text-sm text-muted-foreground">{step.step_name}</p>
                    <p className="font-medium">{formatDate(stepDate)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Packaging Details */}
        {(quote.packaging_carton_quantity || 
          quote.packaging_carton_weight || 
          quote.packaging_carton_length ||
          quote.packaging_carton_width ||
          quote.packaging_carton_height) && (
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Package className="h-5 w-5 mr-2" /> Packaging Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quote.packaging_carton_quantity && (
                <div>
                  <p className="text-sm text-muted-foreground">Carton Quantity</p>
                  <p className="font-medium">{quote.packaging_carton_quantity}</p>
                </div>
              )}
              {quote.packaging_carton_weight && (
                <div>
                  <p className="text-sm text-muted-foreground">Carton Weight</p>
                  <p className="font-medium">{quote.packaging_carton_weight} kg</p>
                </div>
              )}
              {quote.packaging_carton_length && quote.packaging_carton_width && quote.packaging_carton_height && (
                <div>
                  <p className="text-sm text-muted-foreground">Carton Dimensions</p>
                  <p className="font-medium">
                    {quote.packaging_carton_length} × {quote.packaging_carton_width} × {quote.packaging_carton_height} cm
                  </p>
                </div>
              )}
              {quote.packaging_cartons_per_pallet && (
                <div>
                  <p className="text-sm text-muted-foreground">Cartons Per Pallet</p>
                  <p className="font-medium">{quote.packaging_cartons_per_pallet}</p>
                </div>
              )}
              {quote.packaging_copies_per_20ft_palletized && (
                <div>
                  <p className="text-sm text-muted-foreground">Copies Per 20ft (Palletized)</p>
                  <p className="font-medium">{quote.packaging_copies_per_20ft_palletized.toLocaleString()}</p>
                </div>
              )}
              {quote.packaging_copies_per_40ft_palletized && (
                <div>
                  <p className="text-sm text-muted-foreground">Copies Per 40ft (Palletized)</p>
                  <p className="font-medium">{quote.packaging_copies_per_40ft_palletized.toLocaleString()}</p>
                </div>
              )}
              {quote.packaging_copies_per_20ft_unpalletized && (
                <div>
                  <p className="text-sm text-muted-foreground">Copies Per 20ft (Unpalletized)</p>
                  <p className="font-medium">{quote.packaging_copies_per_20ft_unpalletized.toLocaleString()}</p>
                </div>
              )}
              {quote.packaging_copies_per_40ft_unpalletized && (
                <div>
                  <p className="text-sm text-muted-foreground">Copies Per 40ft (Unpalletized)</p>
                  <p className="font-medium">{quote.packaging_copies_per_40ft_unpalletized.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <Separator />
        
        {/* Notes & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notes */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            <div className="bg-muted/30 p-3 rounded-md min-h-[100px]">
              <p className="whitespace-pre-wrap">{quote.notes || "No notes provided"}</p>
            </div>
          </div>
          
          {/* Terms */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Terms</h3>
            <div className="bg-muted/30 p-3 rounded-md min-h-[100px]">
              <p className="whitespace-pre-wrap">{quote.terms || "No terms provided"}</p>
            </div>
          </div>
        </div>
        
        {/* Remarks */}
        {quote.remarks && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Remarks</h3>
            <div className="bg-muted/30 p-3 rounded-md">
              <p className="whitespace-pre-wrap">{quote.remarks}</p>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        {canBeApproved && (onApprove || onReject) && (
          <div className="flex justify-end space-x-3 mt-6">
            {onReject && (
              <Button 
                variant="outline" 
                onClick={() => setRejectModalOpen(true)} 
                className="flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Reject Quote
              </Button>
            )}
            {onApprove && (
              <Button onClick={onApprove} className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Approve Quote
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Rejection Dialog */}
      <AlertDialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Quote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this quote? This action cannot be undone.
              Please provide a reason for rejecting:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason"
            className="my-4"
            required
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRejectConfirm}
              className="bg-destructive text-destructive-foreground"
              disabled={!rejectionReason.trim()}
            >
              Reject Quote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper functions for status display
function getStatusBackgroundColor(status: string): string {
  switch (status) {
    case 'approved':
      return 'bg-green-50 border border-green-200';
    case 'rejected':
      return 'bg-red-50 border border-red-200';
    case 'draft':
      return 'bg-amber-50 border border-amber-200';
    case 'submitted':
    default:
      return 'bg-blue-50 border border-blue-200';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'approved':
      return <Check className="h-5 w-5 text-green-600" />;
    case 'rejected':
      return <X className="h-5 w-5 text-red-600" />;
    case 'draft':
      return <AlertTriangle className="h-5 w-5 text-amber-600" />;
    case 'submitted':
    default:
      return <CalendarDays className="h-5 w-5 text-blue-600" />;
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'approved':
      return 'This quote has been approved';
    case 'rejected':
      return 'This quote has been rejected';
    case 'draft':
      return 'This quote is still a draft and not submitted yet';
    case 'submitted':
      return 'This quote is awaiting approval';
    default:
      return 'Quote status: ' + status;
  }
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case 'approved':
      return 'default';
    case 'rejected':
      return 'destructive';
    case 'draft':
      return 'outline';
    case 'submitted':
    default:
      return 'secondary';
  }
}
