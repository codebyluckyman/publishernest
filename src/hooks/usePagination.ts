
import { useState } from "react";

export type PageSize = 10 | 25 | 50;

interface UsePaginationProps<T> {
  data: T[];
  initialPageSize?: PageSize;
}

export function usePagination<T>({ data, initialPageSize = 10 }: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(initialPageSize);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Get current page data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentData = data.slice(startIndex, endIndex);

  // Page navigation
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const changePageSize = (size: PageSize) => {
    setPageSize(size);
    // When changing page size, adjust current page to maintain view position
    const firstItemIndex = (currentPage - 1) * pageSize;
    const newPage = Math.floor(firstItemIndex / size) + 1;
    setCurrentPage(Math.min(newPage, Math.ceil(totalItems / size)));
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    currentData,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
  };
}
