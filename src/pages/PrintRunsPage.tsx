
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePrintRuns } from '@/hooks/usePrintRuns';
import { useOrganization } from '@/context/OrganizationContext';
import { format } from 'date-fns';
import { Plus, Eye, Printer } from 'lucide-react';

export default function PrintRunsPage() {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const [status, setStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { usePrintRunsList } = usePrintRuns();
  
  const { data: printRuns, isLoading } = usePrintRunsList(
    status || undefined,
    searchQuery || undefined
  );

  const renderPrintRunStatus = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-md">
      <Printer className="h-12 w-12 text-gray-400 mb-3" />
      <h3 className="text-lg font-medium">No print runs found</h3>
      <p className="text-gray-500 mb-4">
        Create a new print run to get started.
      </p>
      <Button onClick={() => navigate('/print-runs/new')}>
        Create a Print Run
      </Button>
    </div>
  );

  const renderLoadingState = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>PO Count</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell className="animate-pulse bg-gray-200 h-8 rounded"></TableCell>
            <TableCell className="animate-pulse bg-gray-200 h-8 rounded"></TableCell>
            <TableCell className="animate-pulse bg-gray-200 h-8 rounded"></TableCell>
            <TableCell className="animate-pulse bg-gray-200 h-8 rounded"></TableCell>
            <TableCell className="animate-pulse bg-gray-200 h-8 rounded"></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Print Runs</h1>
        <Button onClick={() => navigate('/print-runs/new')}>
          <Plus className="mr-2 h-4 w-4" /> New Print Run
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Print Runs</CardTitle>
          <CardDescription>
            Manage print runs for your publications. Each print run can have multiple purchase orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search print runs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            renderLoadingState()
          ) : !printRuns?.length ? (
            renderEmptyState()
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {printRuns.map((printRun) => (
                  <TableRow key={printRun.id}>
                    <TableCell className="font-medium">{printRun.title}</TableCell>
                    <TableCell>{renderPrintRunStatus(printRun.status)}</TableCell>
                    <TableCell>
                      {format(new Date(printRun.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/print-runs/${printRun.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
