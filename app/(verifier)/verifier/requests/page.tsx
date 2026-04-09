'use client';

import * as React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(json => json.data || json);

interface VerificationRequest {
  id: string;
  targetAddress: string;
  credentialType: string;
  credentialTypeName: string;
  claimCount: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt: string;
  respondedAt: string | null;
  isExpired: boolean;
}

export default function RequestsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');

  const statusParam = activeTab !== 'all' ? `&status=${activeTab}` : '';
  const { data, error, isLoading } = useSWR(`/api/verifier/requests?pageSize=50${statusParam}`, fetcher);

  const requests: VerificationRequest[] = data?.requests || [];
  const counts = data?.counts || { pending: 0, approved: 0, rejected: 0, expired: 0 };

  const filteredRequests = React.useMemo(() => {
    if (!searchQuery) return requests;
    const query = searchQuery.toLowerCase();
    return requests.filter(
      r =>
        r.credentialTypeName.toLowerCase().includes(query) ||
        r.targetAddress.toLowerCase().includes(query)
    );
  }, [requests, searchQuery]);

  const getStatusBadge = (status: VerificationRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="warning">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="success">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="muted">
            <XCircle className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        );
    }
  };

  const columns: Column<VerificationRequest>[] = [
    {
      key: 'type',
      header: 'Credential Type',
      cell: (row) => <span className="font-medium">{row.credentialTypeName}</span>,
    },
    {
      key: 'target',
      header: 'Target',
      cell: (row) => (
        <span className="text-muted-foreground font-mono text-xs">
          {row.targetAddress.slice(0, 10)}...{row.targetAddress.slice(-8)}
        </span>
      ),
    },
    {
      key: 'claims',
      header: 'Claims',
      cell: (row) => <span className="text-muted-foreground">{row.claimCount} claims</span>,
    },
    {
      key: 'requestedAt',
      header: 'Requested',
      cell: (row) => <span className="text-muted-foreground">{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'respondedAt',
      header: 'Responded',
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.respondedAt ? formatDate(row.respondedAt) : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => getStatusBadge(row.status),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[100px]',
      cell: (row) => (
        <div className="flex items-center gap-2 justify-end">
          {(row.status === 'approved' || row.status === 'rejected') && (
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href={`/verifier/requests/${row.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          )}
          {row.status === 'pending' && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const totalRequests = counts.pending + counts.approved + counts.rejected + counts.expired;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification Requests"
        description="Manage credential verification requests sent to holders."
        action={
          <Button asChild>
            <Link href="/verifier/requests/new">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by credential type or address..."
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({totalRequests})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <Card>
          <CardContent className="p-6 flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Failed to load requests. Please try again.
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={filteredRequests}
          keyExtractor={(row) => row.id}
        />
      )}
    </div>
  );
}
