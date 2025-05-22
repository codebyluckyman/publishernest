
import React from "react";
import { SupplierQuote } from "@/types/supplierQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/date";

interface MetadataSectionProps {
  quote: SupplierQuote;
}

export function MetadataSection({ quote }: MetadataSectionProps) {
  const metadata = [
    { label: "Quote ID", value: quote.id },
    { label: "Reference ID", value: quote.reference_id || 'N/A' },
    { label: "Reference", value: quote.reference || 'N/A' },
    { label: "Created At", value: formatDate(quote.created_at) },
    { label: "Updated At", value: formatDate(quote.updated_at) },
    { label: "Submitted At", value: formatDate(quote.submitted_at) || 'Not submitted yet' },
    { label: "Valid From", value: formatDate(quote.valid_from) || 'N/A' },
    { label: "Valid To", value: formatDate(quote.valid_to) || 'N/A' },
    { label: "Approved At", value: formatDate(quote.approved_at) || 'Not approved yet' },
    { label: "Approved By", value: quote.approved_by || 'Not approved yet' },
    { label: "Rejected At", value: formatDate(quote.rejected_at) || 'Not rejected' },
    { label: "Rejected By", value: quote.rejected_by || 'Not rejected' },
    { label: "Rejection Reason", value: quote.rejection_reason || 'N/A' },
    { label: "Currency", value: quote.currency },
    { label: "Total Cost", value: quote.total_cost !== null ? `${quote.currency} ${quote.total_cost.toFixed(2)}` : 'N/A' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Metadata</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metadata.map((item, index) => (
            <div key={index} className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
