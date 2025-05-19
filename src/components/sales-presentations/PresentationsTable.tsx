
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ColumnDef,
  flexRenderWithOriginal,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { SalesPresentation } from '@/types/salesPresentation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, MoreHorizontal, Share } from 'lucide-react';
import { format } from 'date-fns';

interface PresentationsTableProps {
  presentations: SalesPresentation[];
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  onShare: (id: string) => void;
}

export const PresentationsTable: React.FC<PresentationsTableProps> = ({
  presentations,
  onDelete,
  onPublish,
  onShare
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const navigate = useNavigate();
  
  const columns: ColumnDef<SalesPresentation>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getRowModel().rows.length > 0 &&
            table.getRowModel().rows.every(row => selectedRows.includes(row.original.id))
          }
          onCheckedChange={(value) => {
            if (value) {
              setSelectedRows(table.getRowModel().rows.map(row => row.original.id));
            } else {
              setSelectedRows([]);
            }
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRows.includes(row.original.id)}
          onCheckedChange={(value) => {
            if (value) {
              setSelectedRows([...selectedRows, row.original.id]);
            } else {
              setSelectedRows(selectedRows.filter(id => id !== row.original.id));
            }
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: "Title",
      accessorKey: "title",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.title}</div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={status === 'published' ? 'success' : (status === 'archived' ? 'secondary' : 'default')}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      header: "Created",
      accessorKey: "created_at",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {format(new Date(row.original.created_at), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const presentation = row.original;
        
        return (
          <div className="flex justify-end">
            {presentation.status === 'published' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(presentation.id);
                }}
              >
                <Share className="h-4 w-4" />
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/sales-presentations/${presentation.id}`)}>
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/sales-presentations/${presentation.id}/edit`)}>
                  Edit
                </DropdownMenuItem>
                {presentation.status !== 'published' && (
                  <DropdownMenuItem onClick={() => onPublish(presentation.id)}>
                    Publish
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete(presentation.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: presentations,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : header.column.columnDef.header}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/sales-presentations/${row.original.id}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} onClick={(e) => cell.column.id === 'select' && e.stopPropagation()}>
                    {cell.column.columnDef.cell ? cell.column.columnDef.cell({ row, table, column: cell.column }) : cell.getValue() as React.ReactNode}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No presentations found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PresentationsTable;
