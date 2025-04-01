
import { useState } from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuoteHeader } from "./QuoteHeader";
import { TermsView } from "./TermsView";
import { NotesView } from "./NotesView";
import { ScheduleView } from "./ScheduleView";
import { PackagingDetailsView } from "./PackagingDetailsView";
import { AttachmentsView } from "./AttachmentsView";
import { QuoteStatusActions } from "./QuoteStatusActions";

interface SupplierQuoteDetailProps {
  quote: SupplierQuote;
  onEdit?: () => void;
  onSubmit?: () => void;
  onApprove?: () => void;
  onReject?: (reason?: string) => void;
  onShowHistory?: () => void;
  isPublisher: boolean;
}

export function SupplierQuoteDetail({
  quote,
  onEdit,
  onSubmit,
  onApprove,
  onReject,
  onShowHistory,
  isPublisher
}: SupplierQuoteDetailProps) {
  const [activeTab, setActiveTab] = useState("terms");
  
  return (
    <div className="space-y-6">
      <QuoteHeader 
        quote={quote}
        onEdit={onEdit}
        onShowHistory={onShowHistory}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full h-auto">
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
