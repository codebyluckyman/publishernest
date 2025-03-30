
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Control } from "react-hook-form";
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
  control: Control<any>;
  quoteRequest: QuoteRequest;
  selectedSupplier: Supplier | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredExtraCosts: ExtraCostTableItem[];
  filteredSavings: SavingTableItem[];
  currencies: { label: string; value: string }[];
  form: any;
}) {
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
        <PriceBreaksSection control={control} quoteRequest={quoteRequest} />
      </TabsContent>
      
      <TabsContent value="extra-costs" className="p-6">
        <ExtraCostsSection 
          control={control} 
          extraCosts={filteredExtraCosts}
        />
      </TabsContent>
      
      <TabsContent value="savings" className="p-6">
        <SavingsSection 
          control={control} 
          savings={filteredSavings}
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
