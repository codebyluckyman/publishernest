
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailsTab } from "./DetailsTab";
import { PriceBreaksTab } from "./PriceBreaksTab";
import { PackagingTab } from "./PackagingTab";
import { SavingsCostsTab } from "./SavingsCostsTab";
import { AttachmentsTab } from "./AttachmentsTab";
import { Control } from "react-hook-form";
import { QuoteRequest } from "@/types/quoteRequest";
import { Supplier } from "@/types/supplier";
import { UseFormReturn } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";

interface FormTabsProps {
  control: Control<any>;
  quoteRequest: QuoteRequest;
  selectedSupplier: Supplier | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
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
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="price-breaks">Price Breaks</TabsTrigger>
        <TabsTrigger value="costs-savings">Costs & Savings</TabsTrigger>
        <TabsTrigger value="packaging">Packaging</TabsTrigger>
        <TabsTrigger value="attachments">Attachments</TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="details" className="space-y-4">
          <DetailsTab 
            control={control} 
            currencies={currencies}
            quoteRequest={quoteRequest}
          />
        </TabsContent>

        <TabsContent value="price-breaks" className="space-y-4">
          <PriceBreaksTab 
            control={control}
            quoteRequest={quoteRequest}
          />
        </TabsContent>

        <TabsContent value="costs-savings" className="space-y-4">
          <SavingsCostsTab 
            control={control}
            quoteRequest={quoteRequest}
            form={form}
          />
        </TabsContent>

        <TabsContent value="packaging" className="space-y-4">
          <PackagingTab 
            control={control}
          />
        </TabsContent>

        <TabsContent value="attachments" className="space-y-4">
          <AttachmentsTab />
        </TabsContent>
      </div>
    </Tabs>
  );
}
