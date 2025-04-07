
import { useState, useEffect } from "react";
import { UnitOfMeasure } from "@/types/unitOfMeasure";
import { fetchUnitOfMeasures } from "@/components/organizations/unitOfMeasures/unitOfMeasuresService";
import { useOrganization } from "./useOrganization";

export function useUnitOfMeasures(organizationId?: string) {
  const { currentOrganization } = useOrganization();
  const [unitOfMeasures, setUnitOfMeasures] = useState<UnitOfMeasure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use either the provided organizationId or fall back to currentOrganization.id
  const effectiveOrgId = organizationId || currentOrganization?.id;

  useEffect(() => {
    if (!effectiveOrgId) {
      setIsLoading(false);
      return;
    }

    const loadUnitOfMeasures = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchUnitOfMeasures(effectiveOrgId);
        setUnitOfMeasures(data);
      } catch (err) {
        console.error("Error loading unit of measures:", err);
        setError(err instanceof Error ? err : new Error("Failed to load unit of measures"));
      } finally {
        setIsLoading(false);
      }
    };

    loadUnitOfMeasures();
  }, [effectiveOrgId]);

  // Format for UI Select/Combobox components
  const unitOptions = unitOfMeasures.map(unit => ({
    label: unit.abbreviation ? `${unit.name} (${unit.abbreviation})` : unit.name,
    value: unit.id
  }));

  // Get only inventory units
  const inventoryUnitOptions = unitOfMeasures
    .filter(unit => unit.is_inventory_unit)
    .map(unit => ({
      label: unit.abbreviation ? `${unit.name} (${unit.abbreviation})` : unit.name,
      value: unit.id
    }));

  // Helper to get unit name from id
  const getUnitNameById = (id: string | null | undefined): string | null => {
    if (!id) return null;
    const unit = unitOfMeasures.find(u => u.id === id);
    return unit ? (unit.abbreviation ? `${unit.name} (${unit.abbreviation})` : unit.name) : null;
  };

  return {
    unitOfMeasures,
    unitOptions,
    inventoryUnitOptions,
    isLoading,
    error,
    getUnitNameById
  };
}
