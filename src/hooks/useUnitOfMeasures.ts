
import { useState, useEffect } from "react";
import { UnitOfMeasure } from "@/types/unitOfMeasure";
import { fetchUnitOfMeasures } from "@/components/organizations/unitOfMeasures/unitOfMeasuresService";
import { useOrganization } from "./useOrganization";

export function useUnitOfMeasures() {
  const { currentOrganization } = useOrganization();
  const [unitOfMeasures, setUnitOfMeasures] = useState<UnitOfMeasure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!currentOrganization) {
      setIsLoading(false);
      return;
    }

    const loadUnitOfMeasures = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchUnitOfMeasures(currentOrganization.id);
        setUnitOfMeasures(data);
      } catch (err) {
        console.error("Error loading unit of measures:", err);
        setError(err instanceof Error ? err : new Error("Failed to load unit of measures"));
      } finally {
        setIsLoading(false);
      }
    };

    loadUnitOfMeasures();
  }, [currentOrganization]);

  // Format for UI Select/Combobox components
  const unitOptions = unitOfMeasures.map(unit => ({
    label: unit.abbreviation ? `${unit.name} (${unit.abbreviation})` : unit.name,
    value: unit.id
  }));

  return {
    unitOfMeasures,
    unitOptions,
    isLoading,
    error
  };
}
