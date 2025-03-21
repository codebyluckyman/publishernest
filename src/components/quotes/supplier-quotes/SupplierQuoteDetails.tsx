
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { SupplierQuote } from "@/types/supplierQuote";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SupplierQuoteAuditHistory } from "./SupplierQuoteAuditHistory";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SupplierQuoteDetailsProps {
  supplierQuote: SupplierQuote;
  onClose: () => void;
}

export function SupplierQuoteDetails({ supplierQuote, onClose }: SupplierQuoteDetailsProps) {
  const { user } = useAuth();
  const { useAcceptSupplierQuote, useDeclineSupplierQuote } = useSupplierQuotes();
  const [showAuditHistory, setShowAuditHistory] = useState(false);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
  const [acceptedCost, setAcceptedCost] = useState(
    supplierQuote.total_cost?.toString() || ""
  );
  const [declineReason, setDeclineReason] = useState("");

  const acceptMutation = useAcceptSupplierQuote();
  const declineMutation = useDeclineSupplierQuote();

  const handleAcceptQuote = () => {
    if (!acceptedCost) {
      toast.error("Please enter the accepted cost");
      return;
    }

    acceptMutation.mutate(
      {
        id: supplierQuote.id,
        acceptedCost: parseFloat(acceptedCost),
      },
      {
        onSuccess: () => {
          setIsAcceptDialogOpen(false);
          onClose();
        },
      }
    );
  };

  const handleDeclineQuote = () => {
    declineMutation.mutate(
      {
        id: supplierQuote.id,
        reason: declineReason,
      },
      {
        onSuccess: () => {
          setIsDeclineDialogOpen(false);
          onClose();
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-500">Submitted</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500">Accepted</Badge>;
      case 'declined':
        return <Badge className="bg-red-500">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Show audit history if requested
  if (showAuditHistory) {
    return (
      <SupplierQuoteAuditHistory
        supplierQuote={supplierQuote}
        isOpen={showAuditHistory}
        onOpenChange={setShowAuditHistory}
      />
    );
  }

  return (
    <div className="space-y-6 py-6">
      {/* Header with actions */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            {supplierQuote.quote_request?.title || "Untitled Quote Request"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {supplierQuote.suppliers?.supplier_name || "Unknown Supplier"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAuditHistory(true)}
          >
            View History
          </Button>
        </div>
      </div>

      {/* Status and date info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Status</p>
          <div>{getStatusBadge(supplierQuote.status)}</div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Submitted</p>
          <p className="text-sm">
            {supplierQuote.submitted_at
              ? format(new Date(supplierQuote.submitted_at), "PPP")
              : "Not submitted"}
          </p>
        </div>
      </div>

      <Separator />

      {/* Price Breaks */}
      <div>
        <h4 className="font-medium mb-2">Price Breaks</h4>
        {supplierQuote.price_breaks && supplierQuote.price_breaks.length > 0 ? (
          <div className="space-y-3">
            {supplierQuote.price_breaks.map((priceBreak) => (
              <div
                key={priceBreak.id}
                className="border rounded-md p-3 shadow-sm"
              >
                <div className="flex justify-between">
                  <div className="font-medium">
                    {priceBreak.format?.format?.format_name || "Unknown Format"}
                  </div>
                  <div>
                    {priceBreak.unit_cost
                      ? `${supplierQuote.currency} ${priceBreak.unit_cost} per unit`
                      : "No cost provided"}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Quantity: {priceBreak.quantity}
                </div>
                {priceBreak.product && (
                  <div className="text-sm text-muted-foreground">
                    Product: {priceBreak.product.title || "Unknown Product"}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No price breaks provided</p>
        )}
      </div>

      {/* Extra Costs */}
      {supplierQuote.extra_costs && supplierQuote.extra_costs.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Extra Costs</h4>
            <div className="space-y-3">
              {supplierQuote.extra_costs.map((extraCost) => (
                <div
                  key={extraCost.id}
                  className="border rounded-md p-3 shadow-sm"
                >
                  <div className="flex justify-between">
                    <div className="font-medium">
                      {extraCost.extra_cost?.name || "Unknown Cost"}
                    </div>
                    <div>
                      {extraCost.unit_cost
                        ? `${supplierQuote.currency} ${extraCost.unit_cost}`
                        : "No cost provided"}
                    </div>
                  </div>
                  {extraCost.notes && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Notes: {extraCost.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Savings */}
      {supplierQuote.savings && supplierQuote.savings.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Savings</h4>
            <div className="space-y-3">
              {supplierQuote.savings.map((saving) => (
                <div
                  key={saving.id}
                  className="border rounded-md p-3 shadow-sm"
                >
                  <div className="flex justify-between">
                    <div className="font-medium">
                      {saving.saving?.name || "Unknown Saving"}
                    </div>
                    <div>
                      {saving.unit_cost
                        ? `${supplierQuote.currency} ${saving.unit_cost}`
                        : "No saving provided"}
                    </div>
                  </div>
                  {saving.notes && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Notes: {saving.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Notes */}
      {supplierQuote.notes && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Notes</h4>
            <p className="text-sm whitespace-pre-wrap">{supplierQuote.notes}</p>
          </div>
        </>
      )}

      {/* Total Cost */}
      <Separator />
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Total Cost</h4>
        <div className="text-lg font-semibold">
          {supplierQuote.total_cost
            ? `${supplierQuote.currency} ${supplierQuote.total_cost.toLocaleString()}`
            : "Not specified"}
        </div>
      </div>

      {/* Action Buttons */}
      {supplierQuote.status === "submitted" && (
        <>
          <Separator />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeclineDialogOpen(true)}>
              Decline
            </Button>
            <Button onClick={() => setIsAcceptDialogOpen(true)}>
              Accept
            </Button>
          </div>
        </>
      )}

      {/* Accept Dialog */}
      <AlertDialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Quote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to accept this quote? This will mark the quote as accepted and notify the supplier.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="acceptedCost">Accepted Cost ({supplierQuote.currency})</Label>
            <Input
              id="acceptedCost"
              value={acceptedCost}
              onChange={(e) => setAcceptedCost(e.target.value)}
              type="number"
              step="0.01"
              className="mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAcceptQuote}>
              Accept Quote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Decline Dialog */}
      <AlertDialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Quote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to decline this quote? This will mark the quote as declined and notify the supplier.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="declineReason">Reason (Optional)</Label>
            <Input
              id="declineReason"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeclineQuote} className="bg-red-600 hover:bg-red-700">
              Decline Quote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
