import { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Copy, Trash2, ArrowDown, ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SalesPresentation } from "@/types/salesPresentation";
import { useToast } from "@/components/ui/use-toast";
import { useDeletePresentation } from "@/hooks/useSalesPresentations";
import { confirm } from "@/components/ui/confirm";

interface PresentationsTableProps {
  presentations: SalesPresentation[];
  onEdit: (presentation: SalesPresentation) => void;
  onDuplicate: (presentation: SalesPresentation) => void;
}

function compare(a: any, b: any) {
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function PresentationsTable({
  presentations,
  onEdit,
  onDuplicate,
}: PresentationsTableProps) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const deletePresentation = useDeletePresentation();

  const columns: ColumnDef<SalesPresentation>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Title",
      },
      {
        accessorKey: "status",
        header: "Status",
      },
      {
        accessorKey: "created_at",
        header: "Created At",
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const presentation = row.original;

          const handleDuplicate = async (
            event: React.MouseEvent<HTMLButtonElement, MouseEvent>
          ) => {
            event.stopPropagation();
            onDuplicate(presentation);
          };

          const handleEdit = async (
            event: React.MouseEvent<HTMLButtonElement, MouseEvent>
          ) => {
            event.stopPropagation();
            onEdit(presentation);
          };

          const handleDelete = async (
            event: React.MouseEvent<HTMLButtonElement, MouseEvent>
          ) => {
            event.stopPropagation();
            const confirmed = await confirm({
              title: "Delete Presentation",
              description:
                "Are you sure you want to delete this presentation? This action cannot be undone.",
            });

            if (!confirmed) {
              return;
            }

            deletePresentation.mutate(presentation.id, {
              onSuccess: () => {
                toast({
                  title: "Success",
                  description: "Presentation deleted successfully.",
                });
              },
              onError: (error: any) => {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: error.message,
                });
              },
            });
          };

          const handleShare = async (
            event: React.MouseEvent<HTMLButtonElement, MouseEvent>
          ) => {
            event.stopPropagation();
            navigate(`/sales-presentations/${presentation.id}/share`);
          };

          const handleView = async (
            event: React.MouseEvent<HTMLButtonElement, MouseEvent>
          ) => {
            event.stopPropagation();
            navigate(`/sales-presentations/${presentation.id}/view`);
          };

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleView}>View</DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>Share</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="mr-2 h-4 w-4" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-500">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [navigate, onEdit, onDuplicate, deletePresentation, toast]
  );

  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: presentations,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      rowSelection,
    },
  });

  const sorted = useMemo(() => {
    if (!search) {
      return [...presentations];
    }

    const searchTerm = search.toLowerCase();
    return presentations.filter((presentation) => {
      return presentation.title.toLowerCase().includes(searchTerm);
    });
  }, [search, presentations]);

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          type="search"
          placeholder="Search presentations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto w-1/3"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {
                        {
                          asc: <ArrowUp className="ml-2 h-4 w-4" />,
                          desc: <ArrowDown className="ml-2 h-4 w-4" />,
                        }[header.column.getIsSorted() as string]
                      }
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => navigate(`/sales-presentations/${row.original.id}`)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of {table.getCoreRowModel().rows.length}{" "}
          row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
