
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Control, useWatch } from "react-hook-form";
import { QuoteDetailsSection } from "./QuoteDetailsSection";
import { PriceBreaksSection } from "./PriceBreaksSection";
import { ExtraCostsSection } from "./ExtraCostsSection";
import { SavingsSection } from "./SavingsSection";
import { TermsSection } from "./TermsSection";
import { AttachmentsSection } from "./AttachmentsSection";
import { ScheduleSection } from "./ScheduleSection";
import { QuoteRequest } from "@/types/quoteRequest";
import { Supplier } from "@/types/supplier";
import { ExtraCostTableItem } from "@/types/extraCost";
import { SavingTableItem } from "@/types/saving";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";

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
}: { 
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
  selectedSupplier: Supplier | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredExtraCosts: ExtraCostTableItem[];
  filteredSavings: SavingTableItem[];
  currencies: { label: string; value: string }[];
  form: any;
}) {
  // Get the current currency value from the form
  const currency = useWatch({
    control,
    name: "currency"
  });

  return (
    <Tabs 
      defaultValue="details" 
      className="w-full" 
      value={activeTab} 
      onValueChange={setActiveTab}
    >
      <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
        <TabsTrigger value="extra-costs">Extra Costs</TabsTrigger>
        <TabsTrigger value="savings">Savings</TabsTrigger>
        <TabsTrigger value="terms">Terms</TabsTrigger>
        <TabsTrigger value="attachments">Attachments</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="p-6">
        <QuoteDetailsSection form={form} currencies={currencies} />
      </TabsContent>
      
      <TabsContent value="pricing" className="p-6">
        <PriceBreaksSection 
          control={control} 
          quoteRequest={quoteRequest} 
          selectedSupplier={selectedSupplier}
          currency={currency}
        />
      </TabsContent>
      
      <TabsContent value="extra-costs" className="p-6">
        <ExtraCostsSection 
          control={control} 
          extraCosts={filteredExtraCosts}
          currency={currency}
          formats={quoteRequest.formats}
        />
      </TabsContent>
      
      <TabsContent value="savings" className="p-6">
        <SavingsSection 
          control={control} 
          savings={filteredSavings}
          currency={currency}
          formats={quoteRequest.formats}
        />
      </TabsContent>
      
      <TabsContent value="terms" className="p-6">
        <TermsSection control={control} />
      </TabsContent>
      
      <TabsContent value="attachments" className="p-6">
        <AttachmentsSection 
          supplierQuote={{ id: form.getValues('id') }} 
          supplierName={selectedSupplier?.supplier_name}
        />
      </TabsContent>
      
      <TabsContent value="schedule" className="p-6">
        <ScheduleSection 
          control={control} 
          requiredStepId={quoteRequest.required_step_id}
          requiredStepName={quoteRequest.required_step_name}
        />
      </TabsContent>
    </Tabs>
  );
}
