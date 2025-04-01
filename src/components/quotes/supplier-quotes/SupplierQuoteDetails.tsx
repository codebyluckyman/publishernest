
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

  // Calculate total cost from price breaks
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
      
      {/* Collapsible sections */}
      <div className="space-y-4">
        <CollapsibleSection
          title="Notes"
          isOpen={isNotesOpen}
          onOpenChange={setIsNotesOpen}
          isEmpty={!supplierQuote.notes}
        >
          <p className="text-sm whitespace-pre-wrap">{supplierQuote.notes}</p>
        </CollapsibleSection>
        
        <CollapsibleSection
          title="Terms & Conditions"
          isOpen={isTermsOpen}
          onOpenChange={setIsTermsOpen}
          isEmpty={!supplierQuote.terms}
        >
          <p className="text-sm whitespace-pre-wrap">{supplierQuote.terms}</p>
        </CollapsibleSection>
        
        <CollapsibleSection
          title="Remarks"
          isOpen={isRemarksOpen}
          onOpenChange={setIsRemarksOpen}
          isEmpty={!supplierQuote.remarks}
        >
          <p className="text-sm whitespace-pre-wrap">{supplierQuote.remarks}</p>
        </CollapsibleSection>
      </div>
      
      <Separator />
      
      {/* Attachments */}
      <SupplierQuoteAttachments quoteId={supplierQuote.id} />
      
      <Separator />
      
      {/* Audit History */}
      <div>
        <Button 
          variant="outline" 
          onClick={() => setShowAudit(!showAudit)}
          className="mb-2"
        >
          {showAudit ? "Hide Audit History" : "Show Audit History"}
        </Button>
        
        {showAudit && (
          <SupplierQuoteAuditHistory quoteId={supplierQuote.id} />
        )}
      </div>
      
      <Separator />
      
      {/* Actions */}
      {supplierQuote.status === 'submitted' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Actions</h3>
          
          {confirmingAction === 'accept' ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      You are about to accept this quote. Please confirm the final accepted cost.
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
                      disabled={acceptMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Confirm Accept
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : confirmingAction === 'decline' ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      You are about to decline this quote. Please provide a reason.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <Label htmlFor="declineReason">Reason</Label>
                    <Textarea 
                      id="declineReason"
                      placeholder="Reason for declining this quote"
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={cancelConfirmation}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleDeclineQuote}
                      disabled={declineMutation.isPending || !declineReason.trim()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Confirm Decline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex space-x-2">
              <Button 
                onClick={handleAcceptQuote}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept Quote
              </Button>
              <Button 
                onClick={handleDeclineQuote}
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Decline Quote
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
