
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ColumnDef, 
  flexRender, 
  getCoreRowModel, 
  getSortedRowModel, 
  SortingState, 
  useReactTable 
} from '@tanstack/react-table';
import { SalesPresentation } from '@/types/salesPresentation';
import { formatDate } from '@/utils/formatters';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, EyeIcon, Trash2, Share2 } from 'lucide-react';
import { UserInfo } from '@/services/userService';

interface PresentationsTableProps {
  presentations: SalesPresentation[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
  users?: Map<string, UserInfo>;
}

export function PresentationsTable({ 
  presentations, 
  isLoading, 
  onDelete, 
  onShare,
  users
}: PresentationsTableProps) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleEdit = (id: string) => {
    navigate(`/sales-presentations/${id}/edit`);
  };

  const handleView = (id: string) => {
    navigate(`/sales-presentations/${id}`);
  };

  const columns: ColumnDef<SalesPresentation>[] = [
    {
      id: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="font-medium max-w-[200px] truncate">
          {row.original.title}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={
            status === 'published' 
              ? 'bg-green-100 text-green-800' 
              : status === 'draft'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
          }>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: 'created_by',
      header: 'Created By',
      cell: ({ row }) => {
        const userId = row.original.created_by;
        const user = users?.get(userId);
        return (
          <div>
            {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Unknown User'}
          </div>
        );
      },
    },
    {
      id: 'created_at',
      header: 'Created At',
      cell: ({ row }) => <div>{formatDate(row.original.created_at)}</div>,
    },
    {
      id: 'published_at',
      header: 'Published At',
      cell: ({ row }) => (
        <div>
          {row.original.published_at ? formatDate(row.original.published_at) : '-'}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleView(row.original.id)}>
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original.id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onShare(row.original.id)}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: presentations,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {columns.map((column) => (
                <TableHead key={column.id || String(Math.random())}>
                  {column.header as React.ReactNode}
                </TableHead>
              ))}
            </TableHeader>
            <TableBody>
              {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  {columns.map((column, j) => (
                    <TableCell key={j} className="h-12">
                      <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
                  No presentations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
