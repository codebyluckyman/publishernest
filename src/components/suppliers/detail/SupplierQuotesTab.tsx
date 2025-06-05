
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface SupplierQuotesTabProps {
  supplierId: string;
}

export function SupplierQuotesTab({ supplierId }: SupplierQuotesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Supplier Quotes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Quotes Feature Coming Soon</h3>
          <p className="text-sm max-w-md mx-auto">
            This tab will display all quotes from this supplier, allowing you to view, compare, and manage quote responses.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
