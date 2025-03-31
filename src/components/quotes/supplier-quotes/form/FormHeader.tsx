
import { SupplierSelect } from "./SupplierSelect";
import { QuoteRequest } from "@/types/quoteRequest";
import { Supplier } from "@/types/supplier";

interface FormHeaderProps {
  quoteRequest: QuoteRequest;
  suppliers: Supplier[] | undefined;
  loadingSuppliers: boolean;
  form: any;
  onExistingQuoteFound?: (quoteId: string) => void;
}

export function FormHeader({ 
  quoteRequest, 
  suppliers, 
  loadingSuppliers, 
  form,
  onExistingQuoteFound
}: FormHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="border rounded-md p-4 bg-muted/20">
        <div className="font-medium mb-2">Quote Request: {quoteRequest.title}</div>
        <div className="text-sm text-muted-foreground">{quoteRequest.description}</div>
      </div>
      
      <SupplierSelect 
        control={form.control}
        suppliers={suppliers || []} 
        isLoading={loadingSuppliers}
        defaultSupplierId={quoteRequest.supplier_id}
        quoteRequest={quoteRequest}
        onExistingQuoteFound={onExistingQuoteFound}
      />
    </div>
  );
}
