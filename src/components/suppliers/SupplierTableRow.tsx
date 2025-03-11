
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { Supplier } from "@/types/supplier";
import { Badge } from "@/components/ui/badge";

interface SupplierTableRowProps {
  supplier: Supplier;
  onEditSupplier: (supplierId: string) => void;
  formatDate: (dateString: string | null) => string;
}

export function SupplierTableRow({ supplier, onEditSupplier, formatDate }: SupplierTableRowProps) {
  return (
    <TableRow
      key={supplier.id}
      className="cursor-pointer"
      onClick={() => onEditSupplier(supplier.id)}
    >
      <TableCell className="font-medium">{supplier.supplier_name}</TableCell>
      <TableCell>{supplier.contact_name || "N/A"}</TableCell>
      <TableCell>{supplier.contact_email || "N/A"}</TableCell>
      <TableCell>{supplier.contact_phone || "N/A"}</TableCell>
      <TableCell>
        <Badge variant={supplier.status === "active" ? "success" : "destructive"}>
          {supplier.status}
        </Badge>
      </TableCell>
      <TableCell>{formatDate(supplier.created_at)}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              onEditSupplier(supplier.id);
            }}
            title="Edit supplier"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
