import React from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface SupplierQuoteDetailsProps {
  quote: SupplierQuote;
  onClose: () => void;
}

export function SupplierQuoteDetails({ quote, onClose }: SupplierQuoteDetailsProps) {
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
              <p className="font-medium">{new Date(quote.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reference</p>
              <p className="font-medium">{quote.reference || "—"}</p>
            </div>
          </div>
        </div>
        
        {/* Add more sections as needed */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Notes</h3>
          <p>{quote.notes || "No notes provided"}</p>
        </div>
      </div>
    </div>
  );
}
