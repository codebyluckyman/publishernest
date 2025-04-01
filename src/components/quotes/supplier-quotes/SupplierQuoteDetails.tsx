
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaperclipIcon, CalendarIcon, ArchiveIcon, FileText, Package } from "lucide-react";
import { SupplierQuote } from "@/types/supplierQuote";
import { CollapsibleSection } from "./CollapsibleSection";
import { SupplierQuoteAttachments } from "./SupplierQuoteAttachments";
import { SupplierQuoteAuditHistory } from "./SupplierQuoteAuditHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";

interface SupplierQuoteDetailsProps {
  quote: SupplierQuote;
  onClose: () => void;
  onEdit?: () => void;
  onSubmit?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  onOpenChange: (open: boolean) => void;
  isEmpty: boolean;
}

const Section = ({ title, children, onOpenChange, isEmpty }: SectionProps) => {
  return (
    <Card className="mb-4">
      <CardHeader className="py-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isEmpty ? (
          <p className="text-muted-foreground text-sm italic">No information available</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

export function SupplierQuoteDetails({ 
  quote, 
  onClose, 
  onEdit, 
  onSubmit, 
  onAccept, 
  onDecline 
}: SupplierQuoteDetailsProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [sectionsOpen, setSectionsOpen] = useState({
    terms: true,
    notes: true,
    schedule: true
  });

  // Toggle section open/closed
  const toggleSection = (section: string) => {
    setSectionsOpen(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Format readable date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  // Handle actions based on quote status
  const handleAction = (action: "edit" | "submit" | "accept" | "decline") => {
    switch (action) {
      case "edit":
        onEdit && onEdit();
        break;
      case "submit":
        onSubmit && onSubmit();
        break;
      case "accept":
        onAccept && onAccept();
        break;
      case "decline":
        onDecline && onDecline();
        break;
    }
  };

  // Status badge color
  const getStatusColor = () => {
    switch (quote.status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            Quote {quote.reference || `#${quote.id.substring(0, 8)}`}
          </h2>
          <div className="flex items-center space-x-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}>
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              {quote.created_at && `Created ${formatDate(quote.created_at)}`}
            </span>
            {quote.submitted_at && (
              <span className="text-sm text-muted-foreground">
                Submitted {formatDate(quote.submitted_at)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          {quote.status === "draft" && onEdit && (
            <Button onClick={() => handleAction("edit")}>
              Edit Quote
            </Button>
          )}
          {quote.status === "draft" && onSubmit && (
            <Button onClick={() => handleAction("submit")}>
              Submit Quote
            </Button>
          )}
          {quote.status === "submitted" && onAccept && (
            <Button onClick={() => handleAction("accept")} variant="default">
              Accept Quote
            </Button>
          )}
          {quote.status === "submitted" && onDecline && (
            <Button onClick={() => handleAction("decline")} variant="outline">
              Decline Quote
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Basic Information */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm text-muted-foreground">Supplier:</p>
                    <p className="text-sm font-medium">{quote.supplier?.supplier_name || "Unknown"}</p>
                    
                    <p className="text-sm text-muted-foreground">Currency:</p>
                    <p className="text-sm font-medium">{quote.currency}</p>
                    
                    <p className="text-sm text-muted-foreground">Reference:</p>
                    <p className="text-sm font-medium">{quote.reference || "N/A"}</p>
                    
                    <p className="text-sm text-muted-foreground">Valid From:</p>
                    <p className="text-sm font-medium">{formatDate(quote.valid_from)}</p>
                    
                    <p className="text-sm text-muted-foreground">Valid To:</p>
                    <p className="text-sm font-medium">{formatDate(quote.valid_to)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Price Information */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-lg">Price Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm text-muted-foreground">Total Cost:</p>
                    <p className="text-sm font-medium">
                      {quote.total_cost ? formatCurrency(quote.total_cost, quote.currency) : "Not specified"}
                    </p>
                    
                    <p className="text-sm text-muted-foreground">Price Breaks:</p>
                    <p className="text-sm font-medium">{quote.price_breaks?.length || 0} items</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sections */}
            <CollapsibleSection 
              title="Terms"
              onOpenChange={() => toggleSection('terms')} 
              isEmpty={!quote.terms}
            >
              <div className="whitespace-pre-wrap text-sm">
                {quote.terms}
              </div>
            </CollapsibleSection>

            <CollapsibleSection 
              title="Notes"
              onOpenChange={() => toggleSection('notes')} 
              isEmpty={!quote.notes}
            >
              <div className="whitespace-pre-wrap text-sm">
                {quote.notes}
              </div>
            </CollapsibleSection>

            <CollapsibleSection 
              title="Production Schedule"
              onOpenChange={() => toggleSection('schedule')} 
              isEmpty={!quote.production_schedule || 
                Object.keys(quote.production_schedule || {}).length === 0}
            >
              <div className="space-y-2">
                {quote.production_schedule && Object.entries(quote.production_schedule).map(([step, date]) => (
                  <div key={step} className="grid grid-cols-2 gap-2">
                    <p className="text-sm text-muted-foreground">{step}:</p>
                    <p className="text-sm font-medium">{date ? formatDate(date) : "Not specified"}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Packaging Information */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-lg flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Packaging
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!quote.packaging_carton_quantity ? (
                  <p className="text-muted-foreground text-sm italic">No packaging information available</p>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Carton Quantity</p>
                        <p className="font-medium">{quote.packaging_carton_quantity || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Carton Weight</p>
                        <p className="font-medium">{quote.packaging_carton_weight ? `${quote.packaging_carton_weight} kg` : "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Carton Dimensions</p>
                        <p className="font-medium">
                          {quote.packaging_carton_length && quote.packaging_carton_width && quote.packaging_carton_height
                            ? `${quote.packaging_carton_length}×${quote.packaging_carton_width}×${quote.packaging_carton_height} mm`
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Carton Volume</p>
                        <p className="font-medium">{quote.packaging_carton_volume ? `${quote.packaging_carton_volume} m³` : "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cartons per Pallet</p>
                        <p className="font-medium">{quote.packaging_cartons_per_pallet || "-"}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Container Capacity</h4>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">20ft Palletized</p>
                          <p className="font-medium">{quote.packaging_copies_per_20ft_palletized || "-"} copies</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">40ft Palletized</p>
                          <p className="font-medium">{quote.packaging_copies_per_40ft_palletized || "-"} copies</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">20ft Unpalletized</p>
                          <p className="font-medium">{quote.packaging_copies_per_20ft_unpalletized || "-"} copies</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">40ft Unpalletized</p>
                          <p className="font-medium">{quote.packaging_copies_per_40ft_unpalletized || "-"} copies</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments">
            <SupplierQuoteAttachments quote={quote} />
          </TabsContent>

          <TabsContent value="history">
            <SupplierQuoteAuditHistory supplierQuoteId={quote.id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
