
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
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
  const navigate = useNavigate();

  const handleViewSupplier = () => {
    navigate(`/suppliers/${supplier.id}`);
  };

  return (
    <TableRow key={supplier.id} className="cursor-pointer hover:bg-muted/50">
      <TableCell className="font-medium">{supplier.supplier_name}</TableCell>
      <TableCell>{supplier.contact_name || "N/A"}</TableCell>
      <TableCell>{supplier.contact_email || "N/A"}</TableCell>
      <TableCell>{supplier.contact_phone || "N/A"}</TableCell>
      <TableCell>
        <Badge variant={supplier.status === "active" ? "default" : "destructive"}>
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
              handleViewSupplier();
            }}
            title="View supplier details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
