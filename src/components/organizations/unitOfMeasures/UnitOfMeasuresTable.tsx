import { useState, useEffect } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { UnitOfMeasure } from "@/types/unitOfMeasure";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Check, X, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchUnitOfMeasures, createUnitOfMeasure, updateUnitOfMeasure, deleteUnitOfMeasure } from "./unitOfMeasuresService";
import { toast } from "sonner";
import { usePagination, PageSize } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";

export function UnitOfMeasuresTable() {
  const { currentOrganization } = useOrganization();
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: "", abbreviation: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedUnit, setEditedUnit] = useState({ name: "", abbreviation: "" });

  const {
    currentData: paginatedUnits,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
  } = usePagination<UnitOfMeasure>({
    data: units,
    initialPageSize: 10,
  });

  useEffect(() => {
    if (currentOrganization) {
      loadUnitOfMeasures();
    }
  }, [currentOrganization]);

  const loadUnitOfMeasures = async () => {
    if (!currentOrganization) return;
    
    setLoading(true);
    try {
      const data = await fetchUnitOfMeasures(currentOrganization.id);
      setUnits(data);
    } catch (error) {
      console.error("Error fetching unit of measures:", error);
      toast.error("Failed to load unit of measures");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setNewUnit({ name: "", abbreviation: "" });
  };

  const handleAddCancel = () => {
    setIsAdding(false);
  };

  const handleAddSubmit = async () => {
    if (!currentOrganization) return;
    if (!newUnit.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      const createdUnit = await createUnitOfMeasure(currentOrganization.id, newUnit);
      setUnits([...units, createdUnit]);
      setIsAdding(false);
      toast.success("Unit of measure added successfully");
    } catch (error) {
      console.error("Error adding unit of measure:", error);
      toast.error("Failed to add unit of measure");
    }
  };

  const handleEditClick = (unit: UnitOfMeasure) => {
    setEditingId(unit.id);
    setEditedUnit({
      name: unit.name,
      abbreviation: unit.abbreviation || "",
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleEditSubmit = async () => {
    if (!editingId || !editedUnit.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      const updatedUnit = await updateUnitOfMeasure(editingId, editedUnit);
      setUnits(units.map(unit => unit.id === editingId ? updatedUnit : unit));
      setEditingId(null);
      toast.success("Unit of measure updated successfully");
    } catch (error) {
      console.error("Error updating unit of measure:", error);
      toast.error("Failed to update unit of measure");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUnitOfMeasure(id);
      setUnits(units.filter(unit => unit.id !== id));
      toast.success("Unit of measure deleted successfully");
    } catch (error) {
      console.error("Error deleting unit of measure:", error);
      toast.error("Failed to delete unit of measure");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit Of Measures</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage standard units of measure for your organization
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Abbreviation</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      Loading units of measure...
                    </TableCell>
                  </TableRow>
                ) : units.length === 0 && !isAdding ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      No units of measure defined. Add one below.
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {paginatedUnits.map((unit) => (
                      <TableRow key={unit.id}>
                        {editingId === unit.id ? (
                          <>
                            <TableCell>
                              <Input 
                                value={editedUnit.name} 
                                onChange={(e) => setEditedUnit({...editedUnit, name: e.target.value})}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={editedUnit.abbreviation} 
                                onChange={(e) => setEditedUnit({...editedUnit, abbreviation: e.target.value})}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={handleEditSubmit}
                                  className="text-primary"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={handleEditCancel}
                                  className="text-muted-foreground"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{unit.name}</TableCell>
                            <TableCell>{unit.abbreviation || '-'}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleEditClick(unit)}
                                  className="text-primary"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDelete(unit.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                    {isAdding && (
                      <TableRow>
                        <TableCell>
                          <Input 
                            placeholder="Name" 
                            value={newUnit.name} 
                            onChange={(e) => setNewUnit({...newUnit, name: e.target.value})}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            placeholder="Abbreviation (optional)" 
                            value={newUnit.abbreviation} 
                            onChange={(e) => setNewUnit({...newUnit, abbreviation: e.target.value})}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={handleAddSubmit}
                              className="text-primary"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={handleAddCancel}
                              className="text-muted-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
          
          {units.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={goToPage}
              onPreviousPage={previousPage}
              onNextPage={nextPage}
              onPageSizeChange={changePageSize}
            />
          )}
          
          {!isAdding && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2" 
              onClick={handleAddClick}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Unit of Measure
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
