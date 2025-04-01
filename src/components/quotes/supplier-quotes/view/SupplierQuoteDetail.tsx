
import { useState } from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuoteHeader } from "./QuoteHeader";
import { PriceBreaksView } from "./PriceBreaksView";
import { TermsView } from "./TermsView";
import { NotesView } from "./NotesView";
import { ScheduleView } from "./ScheduleView";
import { PackagingDetailsView } from "./PackagingDetailsView";
import { AttachmentsView } from "./AttachmentsView";
import { QuoteStatusBar } from "./QuoteStatusBar";

interface SupplierQuoteDetailProps {
  quote: SupplierQuote;
  onEdit?: () => void;
  onSubmit?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  onShowHistory?: () => void;
  isPublisher: boolean;
}

export function SupplierQuoteDetail({
  quote,
  onEdit,
  onSubmit,
  onAccept,
  onDecline,
  onShowHistory,
  isPublisher
}: SupplierQuoteDetailProps) {
  const [activeTab, setActiveTab] = useState("pricing");
  
  return (
    <div className="space-y-6">
      <QuoteHeader 
        quote={quote}
        onEdit={onEdit}
        onShowHistory={onShowHistory}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto">
          <TabsTrigger value="pricing" className="py-2 text-xs md:text-sm">
            Pricing
          </TabsTrigger>
          <TabsTrigger value="terms" className="py-2 text-xs md:text-sm">
            Terms
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
          <TabsContent value="pricing">
            <div className="space-y-4">
              <PriceBreaksView quote={quote} />
              <AttachmentsView quote={quote} />
            </div>
          </TabsContent>
          
          <TabsContent value="terms">
            <TermsView quote={quote} />
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
      
      <QuoteStatusBar
        status={quote.status}
        onSubmit={onSubmit}
        onAccept={onAccept}
        onDecline={onDecline}
        isPublisher={isPublisher}
      />
    </div>
  );
}
