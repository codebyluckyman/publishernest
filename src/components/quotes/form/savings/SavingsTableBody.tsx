
import { useState } from "react";
import { 
  TableBody, 
  TableCell, 
  TableRow 
} from "@/components/ui/table";
import { SavingTableItem } from "@/types/saving";
import { SavingRow } from "./SavingRow";
import { EditableSavingRow } from "./EditableSavingRow";

interface SavingsTableBodyProps {
  loading: boolean;
  savings: SavingTableItem[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onUpdateSuccess: (updatedSaving: SavingTableItem) => void;
  onDeleteSuccess: (deletedId: string) => void;
}

export function SavingsTableBody({ 
  loading, 
  savings, 
  editingId, 
  setEditingId,
  onUpdateSuccess,
  onDeleteSuccess
}: SavingsTableBodyProps) {
  const [editedSaving, setEditedSaving] = useState({
    name: "",
    description: "",
    unit_of_measure_id: ""
  });

  const handleEditClick = (saving: SavingTableItem) => {
    setEditingId(saving.id);
    setEditedSaving({
      name: saving.name,
      description: saving.description || "",
      unit_of_measure_id: saving.unit_of_measure_id || ""
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
            Loading savings...
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (savings.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={4} className="text-center py-4">
            No savings found. Add one below.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {savings.map((saving) => (
        <TableRow key={saving.id}>
          {editingId === saving.id ? (
            <EditableSavingRow 
              saving={saving}
              editedSaving={editedSaving}
              setEditedSaving={setEditedSaving}
              onCancel={handleEditCancel}
              onSuccess={onUpdateSuccess}
            />
          ) : (
            <SavingRow 
              saving={saving}
              onEditClick={handleEditClick}
              onDeleteSuccess={onDeleteSuccess}
            />
          )}
        </TableRow>
      ))}
    </TableBody>
  );
}
