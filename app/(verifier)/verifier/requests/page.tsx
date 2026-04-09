'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  Eye,
  Trash2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface VerificationRequest {
  id: string;
  credentialType: string;
  recipientEmail: string;
  requestedAt: string;
  respondedAt?: string;
  status: 'pending' | 'received' | 'expired' | 'cancelled';
}

// Mock requests
const mockRequests: VerificationRequest[] = [
  { id: '1', credentialType: 'University Degree', recipientEmail: 'candidate1@email.com', requestedAt: '2024-12-17T10:00:00Z', status: 'pending' },
  { id: '2', credentialType: 'Professional Certificate', recipientEmail: 'candidate2@email.com', requestedAt: '2024-12-16T15:30:00Z', status: 'pending' },
  { id: '3', credentialType: 'Background Check', recipientEmail: 'candidate3@email.com', requestedAt: '2024-12-15T09:45:00Z', status: 'pending' },
  { id: '4', credentialType: 'Employee Verification', recipientEmail: 'candidate4@email.com', requestedAt: '2024-12-14T14:00:00Z', respondedAt: '2024-12-15T10:30:00Z', status: 'received' },
  { id: '5', credentialType: 'University Degree', recipientEmail: 'candidate5@email.com', requestedAt: '2024-12-10T11:00:00Z', respondedAt: '2024-12-12T09:00:00Z', status: 'received' },
  { id: '6', credentialType: 'Course Completion', recipientEmail: 'candidate6@email.com', requestedAt: '2024-12-05T08:00:00Z', status: 'expired' },
];

export default function RequestsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');

  const filteredRequests = React.useMemo(() => {
    let filtered = mockRequests;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.credentialType.toLowerCase().includes(query) ||
          r.recipientEmail.toLowerCase().includes(query)
      );
    }

    if (activeTab !== 'all') {
      filtered = filtered.filter(r => r.status === activeTab);
    }

    return filtered;
  }, [searchQuery, activeTab]);

  const getStatusBadge = (status: VerificationRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="warning">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'received':
        return (
          <Badge variant="success">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Received
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="muted">
            <XCircle className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
    }
  };

  const columns: Column<VerificationRequest>[] = [
    {
      key: 'type',
      header: 'Credential Type',
      cell: (row) => <span className="font-medium">{row.credentialType}</span>,
    },
    {
      key: 'recipient',
      header: 'Recipient',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{row.recipientEmail}</span>
        </div>
      ),
    },
    {
      key: 'requestedAt',
      header: 'Requested',
      cell: (row) => <span className="text-muted-foreground">{formatDate(row.requestedAt)}</span>,
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
          {row.status === 'received' && (
            <Button variant="ghost" size="icon-sm">
              <Eye className="h-4 w-4" />
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

  const pendingCount = mockRequests.filter(r => r.status === 'pending').length;
  const receivedCount = mockRequests.filter(r => r.status === 'received').length;

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
            placeholder="Search by credential type or email..."
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({mockRequests.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="received">Received ({receivedCount})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredRequests}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}
