
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSize } from "@/hooks/usePagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: PageSize;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageSizeChange: (size: PageSize) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPreviousPage,
  onNextPage,
  onPageSizeChange,
}: PaginationControlsProps) {
  // Generate page numbers to display (show max 5 pages with ellipsis)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    
    // Always include first page
    pages.push(1);
    
    // Determine range of pages to show around current page
    let start = Math.max(2, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);
    
    // Adjust start/end to always show 5 pages
    if (start <= 3) {
      end = Math.min(totalPages - 1, 6);
    }
    
    if (end >= totalPages - 2) {
      start = Math.max(2, totalPages - 5);
    }
    
    // Add ellipsis at the beginning if needed
    if (start > 2) {
      pages.push('ellipsis-start');
    }
    
    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis at the end if needed
    if (end < totalPages - 1) {
      pages.push('ellipsis-end');
    }
    
    // Always include last page
    pages.push(totalPages);
    
    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {totalItems} entries
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value) as PageSize)}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">per page</span>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={onPreviousPage}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {getPageNumbers().map((page, index) => {
              if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => onPageChange(page as number)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext
                onClick={onNextPage}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
