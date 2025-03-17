
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "../StatusBadge";
import { SupplierDisplay } from "../SupplierDisplay";
import { QuoteRequest } from "@/types/quoteRequest";
import { formatDate } from "@/lib/utils";

interface BasicInfoProps {
  request: QuoteRequest;
}

export function BasicInfo({ request }: BasicInfoProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Supplier</p>
            <SupplierDisplay 
              supplierName={request.supplier_name || ''}
              supplierNames={request.supplier_names || []}
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Requested on</p>
            <p className="font-medium">{formatDate(request.requested_at)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Due date</p>
            <p className="font-medium">
              {request.due_date ? formatDate(request.due_date) : "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <StatusBadge status={request.status} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
