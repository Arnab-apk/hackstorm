'use client';

import * as React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTable, type Column } from '@/components/ui/data-table';
import {
  Share2,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Award,
  Building,
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

interface SharedPresentation {
  id: string;
  credentialName: string;
  verifierName: string;
  sharedAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'revoked';
  viewCount: number;
}

// Mock shared presentations
const mockSharedPresentations: SharedPresentation[] = [
  {
    id: '1',
    credentialName: 'Bachelor of Science',
    verifierName: 'TechCorp Inc.',
    sharedAt: '2024-12-15T10:00:00Z',
    expiresAt: '2024-12-22T10:00:00Z',
    status: 'active',
    viewCount: 3,
  },
  {
    id: '2',
    credentialName: 'AWS Solutions Architect',
    verifierName: 'CloudFirst Ltd.',
    sharedAt: '2024-12-10T14:30:00Z',
    expiresAt: '2024-12-17T14:30:00Z',
    status: 'expired',
    viewCount: 5,
  },
  {
    id: '3',
    credentialName: 'Machine Learning Fundamentals',
    verifierName: 'AI Innovations',
    sharedAt: '2024-12-08T09:00:00Z',
    expiresAt: '2024-12-15T09:00:00Z',
    status: 'revoked',
    viewCount: 1,
  },
];

export default function SharedPage() {
  const getStatusBadge = (status: SharedPresentation['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="success">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="muted">
            <Clock className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        );
      case 'revoked':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Revoked
          </Badge>
        );
    }
  };

  const columns: Column<SharedPresentation>[] = [
    {
      key: 'credential',
      header: 'Credential',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <span className="font-medium">{row.credentialName}</span>
        </div>
      ),
    },
    {
      key: 'verifier',
      header: 'Shared With',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>{row.verifierName}</span>
        </div>
      ),
    },
    {
      key: 'sharedAt',
      header: 'Shared',
      cell: (row) => <span className="text-muted-foreground">{formatDate(row.sharedAt)}</span>,
    },
    {
      key: 'expires',
      header: 'Expires',
      cell: (row) => <span className="text-muted-foreground">{formatDate(row.expiresAt)}</span>,
    },
    {
      key: 'views',
      header: 'Views',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span>{row.viewCount}</span>
        </div>
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
      className: 'w-[80px]',
      cell: (row) =>
        row.status === 'active' && (
          <Button variant="ghost" size="icon-sm">
            <XCircle className="h-4 w-4 text-destructive" />
          </Button>
        ),
    },
  ];

  const activeCount = mockSharedPresentations.filter(p => p.status === 'active').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shared Credentials"
        description="View credentials you've shared with verifiers."
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Share2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockSharedPresentations.length}</p>
              <p className="text-sm text-muted-foreground">Total Shares</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Active Links</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockSharedPresentations.reduce((acc, p) => acc + p.viewCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {mockSharedPresentations.length === 0 ? (
        <EmptyState
          icon={<Share2 className="h-8 w-8" />}
          title="No shared credentials"
          description="You haven't shared any credentials yet. Share credentials with verifiers from your wallet."
        />
      ) : (
        <DataTable
          columns={columns}
          data={mockSharedPresentations}
          keyExtractor={(row) => row.id}
        />
      )}
    </div>
  );
}
