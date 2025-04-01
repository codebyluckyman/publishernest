
import React, { useEffect, useState } from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarDays, Package, X } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { fetchProductionSteps } from "@/api/organizations/productionSteps";
import { useOrganization } from "@/context/OrganizationContext";
import { OrganizationProductionStep } from "@/types/organization";

export interface SupplierQuoteDetailsProps {
  quote: SupplierQuote;
  onClose: () => void;
}

export function SupplierQuoteDetails({ quote, onClose }: SupplierQuoteDetailsProps) {
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
  
  return (
    <div className="space-y-6">
      <DialogHeader className="flex flex-row items-center justify-between">
        <DialogTitle className="text-xl">Quote Details</DialogTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Quote details content */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{quote.status}</p>
            </div>
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
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="font-medium">{
                quote.total_cost 
                  ? formatCurrency(quote.total_cost, quote.currency) 
                  : "Not specified"
              }</p>
            </div>
          </div>
        </div>
        
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
            </div>
          </div>
        )}
        
        {/* Notes */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Notes</h3>
          <p>{quote.notes || "No notes provided"}</p>
        </div>
      </div>
    </div>
  );
}
