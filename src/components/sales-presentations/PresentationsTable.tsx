
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PresentationActions } from './PresentationActions';
import { SalesPresentation } from '@/types/salesPresentation';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface PresentationsTableProps {
  presentations: SalesPresentation[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  users: Map<string, any>;
}

export const PresentationsTable = ({
  presentations,
  isLoading,
  onDelete,
  onShare,
  onView,
  onEdit,
  users
}: PresentationsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created by</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-6 w-[250px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[60px] ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : (
            presentations.length > 0 ? (
              presentations.map((presentation) => {
                const user = users.get(presentation.created_by);
                const userName = user 
                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email 
                  : 'Unknown user';
                  
                return (
                  <TableRow key={presentation.id}>
                    <TableCell className="font-medium">{presentation.title}</TableCell>
                    <TableCell>
                      <Badge className={
                        presentation.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : presentation.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }>
                        {presentation.status.charAt(0).toUpperCase() + presentation.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{userName}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(presentation.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(presentation.updated_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <PresentationActions
                        presentation={presentation}
                        onDelete={onDelete}
                        onShare={onShare}
                        onView={onView}
                        onEdit={onEdit}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No presentations found
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
};
