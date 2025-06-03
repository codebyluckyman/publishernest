
import React, { useState } from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { QuoteHeader } from "../view/QuoteHeader";
import { TermsView } from "../view/TermsView";
import { NotesView } from "../view/NotesView";
import { ScheduleView } from "../view/ScheduleView";
import { PackagingDetailsView } from "../view/PackagingDetailsView";
import { AttachmentsView } from "../view/AttachmentsView";
import { QuoteStatusActions } from "../view/QuoteStatusActions";
import { PriceBreaksView } from "../view/PriceBreaksView";
import { ExtraCostsView } from "../view/ExtraCostsView";

interface SupplierQuoteDetailsProps {
  quote: SupplierQuote;
  onEdit?: () => void;
  onClose?: () => void;
  onSubmit?: () => void;
  onApprove?: () => void;
  onReject?: (reason?: string) => void;
  onShowHistory?: () => void;
  isPublisher?: boolean;
}

export function SupplierQuoteDetails({
  quote,
  onEdit,
  onClose,
  onSubmit,
  onApprove,
  onReject,
  onShowHistory,
  isPublisher = false
}: SupplierQuoteDetailsProps) {
  const [activeTab, setActiveTab] = useState("terms");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <QuoteHeader 
          quote={quote}
          onEdit={onEdit}
        />
        {onShowHistory && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onShowHistory}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            History
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 w-full h-auto">
          <TabsTrigger value="terms" className="py-2 text-xs md:text-sm">
            Terms
          </TabsTrigger>
          <TabsTrigger value="pricing" className="py-2 text-xs md:text-sm">
            Pricing
          </TabsTrigger>
          <TabsTrigger value="extra-costs" className="py-2 text-xs md:text-sm">
            Extra Costs & Savings
          </TabsTrigger>
          <TabsTrigger value="notes" className="py-2 text-xs md:text-sm">
            Notes
          </TabsTrigger>
          <TabsTrigger value="schedule" className="py-2 text-xs md:text-sm">
            Schedule
          </TabsTrigger>
          <TabsTrigger value="packaging" className="py-2 text-xs md:text-sm">
            Packaging
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          <TabsContent value="terms">
            <TermsView quote={quote} />
          </TabsContent>
          
          <TabsContent value="pricing">
            <PriceBreaksView quote={quote} />
          </TabsContent>
          
          <TabsContent value="extra-costs">
            <ExtraCostsView quote={quote} />
          </TabsContent>
          
          <TabsContent value="notes">
            <NotesView quote={quote} />
          </TabsContent>
          
          <TabsContent value="schedule">
            <ScheduleView quote={quote} />
          </TabsContent>
          
          <TabsContent value="packaging">
            <PackagingDetailsView quote={quote} />
          </TabsContent>
        </div>
      </Tabs>
      
      <AttachmentsView quote={quote} />
      
      <QuoteStatusActions
        quote={quote}
        onSubmit={onSubmit}
        onApprove={onApprove}
        onReject={onReject}
        isPublisher={isPublisher}
      />
    </div>
  );
}
