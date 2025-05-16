import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Control, UseFormReturn } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { Supplier } from "@/types/supplier";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { DetailsTab } from "./DetailsTab";
import { ProductionScheduleSection } from "./ProductionScheduleSection";
import { PackagingTab } from "./PackagingTab";
import { PricingTab } from "./PricingTab";
import { ExtraCostsTab } from "./ExtraCostsTab";

interface FormTabsProps {
  control: Control<SupplierQuoteFormValues>;
  quoteRequest: any;
  // quoteRequest: QuoteRequest;
  selectedSupplier: Supplier | null;
  activeTab: string;
  setActiveTab: (value: string) => void;
  currencies: { label: string; value: string }[];
  form: UseFormReturn<SupplierQuoteFormValues>;
  mode?: "create" | "edit";
}

export function FormTabs({
  control,
  quoteRequest,
  selectedSupplier,
  activeTab,
  setActiveTab,
  currencies,
  form,
  mode,
}: FormTabsProps) {
  return (
    <Tabs
      defaultValue="details"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-5">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
        <TabsTrigger value="extra-costs">Extra Costs & Savings</TabsTrigger>
        <TabsTrigger value="production">Schedule</TabsTrigger>
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
        <PricingTab control={control} quoteRequest={quoteRequest} />
      </TabsContent>

      <TabsContent value="extra-costs" className="space-y-4 pt-4">
        <ExtraCostsTab
          control={control}
          quoteRequest={quoteRequest}
          mode={mode}
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
        <PackagingTab control={control} />
      </TabsContent>
    </Tabs>
  );
}
