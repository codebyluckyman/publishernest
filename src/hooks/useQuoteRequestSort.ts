
import { useState, useCallback, useMemo } from "react";
import { QuoteRequest, SortQuoteRequestField, SortDirection } from "@/types/quoteRequest";

export function useQuoteRequestSort(quoteRequests: QuoteRequest[]) {
  const [sortField, setSortField] = useState<SortQuoteRequestField>("due_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Handle sorting
  const handleSort = useCallback((field: SortQuoteRequestField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField, sortDirection]);

  // Sort the quote requests
  const sortedQuoteRequests = useMemo(() => {
    return [...quoteRequests].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "requested_at":
          comparison = new Date(a.requested_at).getTime() - new Date(b.requested_at).getTime();
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "supplier_name":
          const supplierNameA = a.supplier_name || "";
          const supplierNameB = b.supplier_name || "";
          comparison = supplierNameA.localeCompare(supplierNameB);
          break;
        case "due_date":
          // Handle null due dates by placing them at the end
          if (!a.due_date && !b.due_date) {
            comparison = 0;
          } else if (!a.due_date) {
            comparison = 1; // a goes after b
          } else if (!b.due_date) {
            comparison = -1; // a goes before b
          } else {
            comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          }
          break;
        default:
          comparison = 0;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [quoteRequests, sortField, sortDirection]);

  return {
    sortField,
    sortDirection,
    handleSort,
    sortedQuoteRequests
  };
}
