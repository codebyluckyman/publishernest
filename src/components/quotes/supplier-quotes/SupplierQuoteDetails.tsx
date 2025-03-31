
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { SupplierQuote } from "@/types/supplierQuote";
import { format } from "date-fns";
import { useState } from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import { SupplierQuoteAttachments } from "./SupplierQuoteAttachments";
import { SupplierQuoteAuditHistory } from "./SupplierQuoteAuditHistory";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SupplierQuoteDetailsProps {
  supplierQuote: SupplierQuote;
  onClose: () => void;
}

export function SupplierQuoteDetails({ supplierQuote, onClose }: SupplierQuoteDetailsProps) {
  const [showAudit, setShowAudit] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [acceptedCost, setAcceptedCost] = useState(supplierQuote.total_cost?.toString() || '');
  const [confirmingAction, setConfirmingAction] = useState<'accept' | 'decline' | null>(null);
  
  // Use the hooks from the useSupplierQuotes hook
  const { 
    useAcceptSupplierQuote,
    useDeclineSupplierQuote
  } = useSupplierQuotes();
  
  const acceptMutation = useAcceptSupplierQuote();
  const declineMutation = useDeclineSupplierQuote();
  
  // Add state for collapsible sections
  const [isExtraCostsOpen, setIsExtraCostsOpen] = useState(false);
  const [isSavingsOpen, setIsSavingsOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isRemarksOpen, setIsRemarksOpen] = useState(false);
  
  const handleAcceptQuote = () => {
    if (confirmingAction === 'accept') {
      acceptMutation.mutate({
        id: supplierQuote.id,
        acceptedCost: parseFloat(acceptedCost)
      }, {
        onSuccess: () => {
          setConfirmingAction(null);
          onClose();
        }
      });
    } else {
      setConfirmingAction('accept');
    }
  };

  const handleDeclineQuote = () => {
    if (confirmingAction === 'decline') {
      declineMutation.mutate({
        id: supplierQuote.id,
        reason: declineReason
      }, {
        onSuccess: () => {
          setConfirmingAction(null);
          onClose();
        }
      });
    } else {
      setConfirmingAction('decline');
    }
  };

  const cancelConfirmation = () => {
    setConfirmingAction(null);
  };

  // Calculate total cost from price breaks, extra costs, and savings
  const calculateTotalCost = () => {
    let total = 0;
    
    // Add price breaks costs
    if (supplierQuote.price_breaks) {
      supplierQuote.price_breaks.forEach(pb => {
        if (pb.unit_cost) {
          total += pb.unit_cost * pb.quantity;
        }
      });
    }
    
    // Add extra costs
    if (supplierQuote.extra_costs) {
      supplierQuote.extra_costs.forEach(ec => {
        if (ec.unit_cost) {
          total += ec.unit_cost;
        }
      });
    }
    
    // Subtract savings
    if (supplierQuote.savings) {
      supplierQuote.savings.forEach(s => {
        if (s.unit_cost) {
          total -= s.unit_cost;
        }
      });
    }
    
    return total;
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

  return (
    <div className="space-y-6 py-4">
      {/* Basic info */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">
              {supplierQuote.reference || supplierQuote.reference_id || "Quote"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {supplierQuote.quote_request?.title || "No quote request title"}
            </p>
          </div>
          <div>{getStatusBadge(supplierQuote.status)}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm font-medium">Supplier</p>
            <p className="text-sm">{supplierQuote.supplier?.supplier_name || "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Created</p>
            <p className="text-sm">{format(new Date(supplierQuote.created_at), "MMM d, yyyy")}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Status</p>
            <p className="text-sm capitalize">{supplierQuote.status}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Submitted</p>
            <p className="text-sm">
              {supplierQuote.submitted_at 
                ? format(new Date(supplierQuote.submitted_at), "MMM d, yyyy") 
                : "Not submitted"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Valid From</p>
            <p className="text-sm">
              {supplierQuote.valid_from 
                ? format(new Date(supplierQuote.valid_from), "MMM d, yyyy") 
                : "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Valid To</p>
            <p className="text-sm">
              {supplierQuote.valid_to 
                ? format(new Date(supplierQuote.valid_to), "MMM d, yyyy") 
                : "Not specified"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium">Total Cost</p>
            <p className="text-lg font-bold">
              {supplierQuote.total_cost 
                ? `${supplierQuote.currency} ${supplierQuote.total_cost.toLocaleString()}`
                : `${supplierQuote.currency} ${calculateTotalCost().toLocaleString()}`}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Formats */}
      {supplierQuote.formats && supplierQuote.formats.length > 0 && (
        <CollapsibleSection 
          title="Formats" 
          isEmpty={false}
          emptyMessage="No formats available"
        >
          <div className="space-y-4">
            {supplierQuote.formats.map((format, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Format Name</p>
                      <p className="text-sm">{format.format_name}</p>
                    </div>
                    {format.dimensions && (
                      <div>
                        <p className="text-sm font-medium">Dimensions</p>
                        <p className="text-sm">{format.dimensions}</p>
                      </div>
                    )}
                    {format.extent && (
                      <div>
                        <p className="text-sm font-medium">Extent</p>
                        <p className="text-sm">{format.extent}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Pricing */}
      {supplierQuote.price_breaks && supplierQuote.price_breaks.length > 0 && (
        <CollapsibleSection 
          title="Pricing" 
          isEmpty={false}
          emptyMessage="No pricing information available"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Quantity</th>
                  <th className="text-right py-2">Unit Cost</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {supplierQuote.price_breaks.map((priceBreak, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{priceBreak.quantity.toLocaleString()}</td>
                    <td className="text-right py-2">
                      {priceBreak.unit_cost 
                        ? `${supplierQuote.currency} ${priceBreak.unit_cost.toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="text-right py-2">
                      {priceBreak.unit_cost 
                        ? `${supplierQuote.currency} ${(priceBreak.unit_cost * priceBreak.quantity).toLocaleString()}`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>
      )}

      {/* Extra Costs */}
      {supplierQuote.extra_costs && supplierQuote.extra_costs.length > 0 && (
        <CollapsibleSection 
          title="Extra Costs"
          isEmpty={supplierQuote.extra_costs.length === 0}
          emptyMessage="No extra costs available"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-right py-2">Cost</th>
                </tr>
              </thead>
              <tbody>
                {supplierQuote.extra_costs.map((extraCost, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">
                      {extraCost.extra_cost?.name || "Unknown"}
                    </td>
                    <td className="text-right py-2">
                      {extraCost.unit_cost 
                        ? `${supplierQuote.currency} ${extraCost.unit_cost.toLocaleString()}`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>
      )}

      {/* Savings */}
      {supplierQuote.savings && supplierQuote.savings.length > 0 && (
        <CollapsibleSection 
          title="Savings"
          isEmpty={supplierQuote.savings.length === 0}
          emptyMessage="No savings available"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-right py-2">Saving</th>
                </tr>
              </thead>
              <tbody>
                {supplierQuote.savings.map((saving, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">
                      {saving.saving?.name || "Unknown"}
                      {saving.notes && (
                        <p className="text-xs text-muted-foreground">{saving.notes}</p>
                      )}
                    </td>
                    <td className="text-right py-2">
                      {saving.unit_cost 
                        ? `${supplierQuote.currency} ${saving.unit_cost.toLocaleString()}`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>
      )}

      {/* Notes */}
      {supplierQuote.notes && (
        <CollapsibleSection 
          title="Notes"
          isEmpty={!supplierQuote.notes}
          emptyMessage="No notes available"
        >
          <div className="p-4 bg-muted/30 rounded-md">
            <p className="text-sm whitespace-pre-wrap">{supplierQuote.notes}</p>
          </div>
        </CollapsibleSection>
      )}

      {/* Terms */}
      {supplierQuote.terms && (
        <CollapsibleSection
          title="Terms"
          isEmpty={!supplierQuote.terms}
          emptyMessage="No terms available"
        >
          <div className="p-4 bg-muted/30 rounded-md">
            <p className="text-sm whitespace-pre-wrap">{supplierQuote.terms}</p>
          </div>
        </CollapsibleSection>
      )}

      {/* Remarks */}
      {supplierQuote.remarks && (
        <CollapsibleSection
          title="Remarks"
          isEmpty={!supplierQuote.remarks}
          emptyMessage="No remarks available"
        >
          <div className="p-4 bg-muted/30 rounded-md">
            <p className="text-sm whitespace-pre-wrap">{supplierQuote.remarks}</p>
          </div>
        </CollapsibleSection>
      )}

      {/* Attachments */}
      {supplierQuote.attachments && supplierQuote.attachments.length > 0 && (
        <CollapsibleSection 
          title="Attachments"
          isEmpty={!supplierQuote.attachments || supplierQuote.attachments.length === 0}
          emptyMessage="No attachments available"
        >
          <SupplierQuoteAttachments 
            supplierQuote={{ id: supplierQuote.id }}
            readOnly
          />
        </CollapsibleSection>
      )}

      {/* Audit History */}
      <div className="flex items-center justify-center">
        <Button 
          variant="outline" 
          onClick={() => setShowAudit(!showAudit)}
        >
          {showAudit ? "Hide Audit History" : "View Audit History"}
        </Button>
      </div>
      
      {showAudit && (
        <SupplierQuoteAuditHistory 
          supplierQuoteId={supplierQuote.id}
          supplierQuote={null} 
        />
      )}

      <Separator />

      {/* Action buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        
        {supplierQuote.status === 'submitted' && (
          <div className="flex space-x-2">
            {confirmingAction === 'accept' ? (
              <div className="bg-white p-4 border rounded-md shadow-md space-y-4">
                <Alert>
                  <AlertDescription>
                    Accepting this quote will mark it as accepted. Are you sure?
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="acceptedCost">Accepted Cost ({supplierQuote.currency})</Label>
                  <Input
                    id="acceptedCost"
                    type="number"
                    step="0.01"
                    value={acceptedCost}
                    onChange={(e) => setAcceptedCost(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={cancelConfirmation}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAcceptQuote}
                    disabled={acceptMutation.isPending || !acceptedCost}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirm Accept
                  </Button>
                </div>
              </div>
            ) : confirmingAction === 'decline' ? (
              <div className="bg-white p-4 border rounded-md shadow-md space-y-4">
                <Alert>
                  <AlertDescription>
                    Declining this quote will mark it as declined. Are you sure?
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="declineReason">Reason for declining (optional)</Label>
                  <Textarea
                    id="declineReason"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={cancelConfirmation}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleDeclineQuote}
                    disabled={declineMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Confirm Decline
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={handleDeclineQuote}
                  disabled={acceptMutation.isPending || declineMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button
                  variant="default"
                  onClick={handleAcceptQuote}
                  disabled={acceptMutation.isPending || declineMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
