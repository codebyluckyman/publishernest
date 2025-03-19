
import { useState } from "react";
import { 
  TableBody, 
  TableCell, 
  TableRow 
} from "@/components/ui/table";
import { ExtraCostTableItem } from "@/types/extraCost";
import { ExtraCostRow } from "./ExtraCostRow";
import { EditableExtraCostRow } from "./EditableExtraCostRow";

interface ExtraCostsTableBodyProps {
  loading: boolean;
  extraCosts: ExtraCostTableItem[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onUpdateSuccess: (updatedCost: ExtraCostTableItem) => void;
  onDeleteSuccess: (deletedId: string) => void;
}

export function ExtraCostsTableBody({ 
  loading, 
  extraCosts, 
  editingId, 
  setEditingId,
  onUpdateSuccess,
  onDeleteSuccess
}: ExtraCostsTableBodyProps) {
  const [editedCost, setEditedCost] = useState({
    name: "",
    description: "",
    unit_of_measure: ""
  });

  const handleEditClick = (cost: ExtraCostTableItem) => {
    setEditingId(cost.id);
    setEditedCost({
      name: cost.name,
      description: cost.description || "",
      unit_of_measure: cost.unit_of_measure || ""
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  if (loading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={4} className="text-center py-4">
            Loading extra costs...
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (extraCosts.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={4} className="text-center py-4">
            No extra costs found. Add one below.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {extraCosts.map((cost) => (
        <TableRow key={cost.id}>
          {editingId === cost.id ? (
            <EditableExtraCostRow 
              cost={cost}
              editedCost={editedCost}
              setEditedCost={setEditedCost}
              onCancel={handleEditCancel}
              onSuccess={onUpdateSuccess}
            />
          ) : (
            <ExtraCostRow 
              cost={cost}
              onEditClick={handleEditClick}
              onDeleteSuccess={onDeleteSuccess}
            />
          )}
        </TableRow>
      ))}
    </TableBody>
  );
}
