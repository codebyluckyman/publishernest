
import { Control, useFormContext } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuoteDetailsSection } from "./QuoteDetailsSection";
import { NotesSection } from "./NotesSection";
import { TermsSection } from "./TermsSection";
import { PriceBreaksSection } from "./PriceBreaksSection";
import { ExtraCostsSection } from "./ExtraCostsSection";
import { SavingsSection } from "./SavingsSection";
import { ScheduleSection } from "./ScheduleSection";
import { AttachmentsSection } from "./AttachmentsSection";
import { QuoteRequest } from "@/types/quoteRequest";
import { Supplier } from "@/types/supplier";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { ExtraCostTableItem } from "@/types/extraCost";
import { SavingTableItem } from "@/types/saving";

interface FormTabsProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
  selectedSupplier: Supplier | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredExtraCosts: ExtraCostTableItem[];
  filteredSavings: SavingTableItem[];
  currencies: { label: string; value: string }[];
  form: any;
}

export function FormTabs({
  control,
  quoteRequest,
  selectedSupplier,
  activeTab,
  setActiveTab,
  filteredExtraCosts,
  filteredSavings,
  currencies,
  form
}: FormTabsProps) {
  const formContext = useFormContext<SupplierQuoteFormValues>();
  const currency = formContext.watch("currency");
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full h-auto">
        <TabsTrigger value="details" className="py-2 text-xs md:text-sm">
          Details
        </TabsTrigger>
        <TabsTrigger value="pricing" className="py-2 text-xs md:text-sm">
          Pricing
        </TabsTrigger>
        <TabsTrigger value="extraCosts" className="py-2 text-xs md:text-sm">
          Extra Costs
        </TabsTrigger>
        <TabsTrigger value="savings" className="py-2 text-xs md:text-sm">
          Savings
        </TabsTrigger>
        <TabsTrigger value="terms" className="py-2 text-xs md:text-sm">
          Terms
        </TabsTrigger>
        <TabsTrigger value="schedule" className="py-2 text-xs md:text-sm">
          Schedule
        </TabsTrigger>
        <TabsTrigger value="attachments" className="py-2 text-xs md:text-sm">
          Attachments
        </TabsTrigger>
      </TabsList>
      
      <div className="mt-4">
        <TabsContent value="details">
          <QuoteDetailsSection 
            form={form}
            currencies={currencies}
          />
        </TabsContent>
        
        <TabsContent value="pricing" className="space-y-4">
          <PriceBreaksSection 
            control={control}
            quoteRequest={quoteRequest}
            selectedSupplier={selectedSupplier}
            currency={currency}
          />
        </TabsContent>
        
        <TabsContent value="extraCosts">
          <ExtraCostsSection 
            control={control}
            extraCosts={filteredExtraCosts}
            currency={currency}
            formats={quoteRequest.formats}
            quoteRequest={quoteRequest}
          />
        </TabsContent>
        
        <TabsContent value="savings">
          <SavingsSection 
            control={control}
            savings={filteredSavings}
            currency={currency}
            formats={quoteRequest.formats}
            quoteRequest={quoteRequest}
          />
        </TabsContent>
        
        <TabsContent value="terms">
          <TermsSection control={control} />
        </TabsContent>
        
        <TabsContent value="schedule">
          <ScheduleSection 
            control={control}
            requiredStepId={quoteRequest.required_step_id}
            requiredStepName={quoteRequest.required_step_name}
          />
        </TabsContent>
        
        <TabsContent value="attachments">
          <AttachmentsSection 
            supplierQuote={{ id: quoteRequest.id }}
            supplierName={quoteRequest.supplier_name}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
