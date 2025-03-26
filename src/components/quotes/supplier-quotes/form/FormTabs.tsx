
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { QuoteDetailsSection } from "./QuoteDetailsSection";
import { PriceBreaksSection } from "./PriceBreaksSection";
import { ExtraCostsSection } from "./ExtraCostsSection";
import { SavingsSection } from "./SavingsSection";
import { NotesSection } from "./NotesSection";
import { ScheduleSection } from "./ScheduleSection";
import { QuoteRequest } from "@/types/quoteRequest";
import { Supplier } from "@/types/supplier";
import { ExtraCostTableItem } from "@/types/extraCost";
import { SavingTableItem } from "@/types/saving";
import { Control } from "react-hook-form";
import { SupplierQuoteFormValues } from "@/types/supplierQuote";
import { useEffect, useState } from "react";

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
  const [gridColumnsClass, setGridColumnsClass] = useState("grid-cols-2");
  
  // Determine if we should show the Schedule tab based on production_schedule_requested
  const showScheduleTab = quoteRequest.production_schedule_requested === true;

  // Determine if we should show Extra Costs and Savings tabs
  const showExtraCostsTab = filteredExtraCosts && filteredExtraCosts.length > 0;
  const showSavingsTab = filteredSavings && filteredSavings.length > 0;

  // Calculate grid columns based on visible tabs with useEffect to ensure it runs after arrays are loaded
  useEffect(() => {
    const baseTabs = 2; // Details and Pricing are always visible
    const extraTabs = (showExtraCostsTab ? 1 : 0) + 
                     (showSavingsTab ? 1 : 0) + 
                     (showScheduleTab ? 1 : 0);
    
    const totalTabs = baseTabs + extraTabs;
    setGridColumnsClass(`grid-cols-${totalTabs}`);
  }, [filteredExtraCosts, filteredSavings, showScheduleTab, showExtraCostsTab, showSavingsTab]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className={`grid w-full ${gridColumnsClass}`}>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
        {showExtraCostsTab && <TabsTrigger value="costs">Extra Costs</TabsTrigger>}
        {showSavingsTab && <TabsTrigger value="savings">Savings</TabsTrigger>}
        {showScheduleTab && <TabsTrigger value="schedule">Schedule</TabsTrigger>}
      </TabsList>
      
      <TabsContent value="details" className="space-y-6">
        <Card className="p-6">
          <QuoteDetailsSection form={form} currencies={currencies} />
        </Card>
        
        <Card className="p-6">
          <NotesSection control={control} />
        </Card>
      </TabsContent>
      
      <TabsContent value="pricing">
        <Card className="p-6">
          <PriceBreaksSection 
            control={control} 
            quoteRequest={quoteRequest}
            selectedSupplier={selectedSupplier}
          />
        </Card>
      </TabsContent>
      
      {showExtraCostsTab && (
        <TabsContent value="costs">
          <Card className="p-6">
            <ExtraCostsSection 
              control={control} 
              extraCosts={filteredExtraCosts} 
              currency={form.watch("currency")} 
            />
          </Card>
        </TabsContent>
      )}
      
      {showSavingsTab && (
        <TabsContent value="savings">
          <Card className="p-6">
            <SavingsSection 
              control={control} 
              savings={filteredSavings} 
              currency={form.watch("currency")} 
            />
          </Card>
        </TabsContent>
      )}
      
      {showScheduleTab && (
        <TabsContent value="schedule">
          <Card className="p-6">
            <ScheduleSection 
              control={control} 
              requiredStepId={quoteRequest.required_step_id}
              requiredStepName={quoteRequest.required_step_name}
            />
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
}
