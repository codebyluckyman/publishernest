
import React, { useEffect, useState } from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Button } from "@/components/ui/button";
import { CalendarDays, Package, X, Check, AlertTriangle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { fetchProductionSteps } from "@/api/organizations/productionSteps";
import { useOrganization } from "@/context/OrganizationContext";
import { OrganizationProductionStep } from "@/types/organization";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
          </div>
        </div>
        
        {/* Formats */}
        {quote.formats && quote.formats.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Formats</h3>
            <div className="space-y-2">
              {quote.formats.map((format) => (
                <div key={format.id} className="p-3 border rounded-md">
                  <p className="font-medium">{format.format_name}</p>
                  {format.dimensions && <p className="text-sm text-gray-600">Dimensions: {format.dimensions}</p>}
                  {format.extent && <p className="text-sm text-gray-600">Extent: {format.extent}</p>}
                </div>
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
              <Button variant="outline" onClick={onReject} className="flex items-center gap-2">
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
