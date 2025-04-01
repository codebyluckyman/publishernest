
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailsTab } from "./DetailsTab";
import { Control, UseFormReturn } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { Supplier } from "@/types/supplier";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { PriceBreaksSection } from "./PriceBreaksSection";
import { ProductionScheduleSection } from "./ProductionScheduleSection";
import { PackagingTab } from "./PackagingTab";

interface FormTabsProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: QuoteRequest;
  selectedSupplier: Supplier | null;
  activeTab: string;
  setActiveTab: (value: string) => void;
  filteredSavings?: any[];
  currencies: { label: string; value: string }[];
  form: UseFormReturn<SupplierQuoteFormValues>;
}

export function FormTabs({
  control,
  quoteRequest,
  selectedSupplier,
  activeTab,
  setActiveTab,
  currencies,
  form
}: FormTabsProps) {  
  return (
    <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
        <TabsTrigger value="production">Production</TabsTrigger>
        <TabsTrigger value="packaging">Packaging</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-4 pt-4">
        <DetailsTab 
          control={control} 
          quoteRequest={quoteRequest}
          selectedSupplier={selectedSupplier}
          currencies={currencies}
        />
      </TabsContent>
      
      <TabsContent value="pricing" className="space-y-4 pt-4">
        <PriceBreaksSection 
          control={control}
          quoteRequest={quoteRequest}
          currency={form.watch("currency")}
        />
      </TabsContent>
      
      <TabsContent value="production" className="space-y-4 pt-4">
        <ProductionScheduleSection 
          control={control}
          scheduleRequested={quoteRequest.production_schedule_requested}
          selectedSupplier={selectedSupplier}
        />
      </TabsContent>
      
      <TabsContent value="packaging" className="space-y-4 pt-4">
        <PackagingTab 
          control={control}
        />
      </TabsContent>
    </Tabs>
  );
}
