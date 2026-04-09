'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  XCircle,
  CheckCircle2,
  Clock,
  Award,
  Loader2,
} from 'lucide-react';
import { formatDate, truncateDID } from '@/lib/utils';
import { toast } from 'sonner';

interface Credential {
  id: string;
  schemaName: string;
  recipientName: string;
  recipientEmail: string;
  issuedAt: string;
  claimed: boolean;
  claimedAt?: string;
  revoked: boolean;
  revokedAt?: string;
}

// Mock data
const mockCredentials: Credential[] = [
  { id: '1', schemaName: 'University Degree', recipientName: 'Alice Johnson', recipientEmail: 'alice@example.com', issuedAt: '2024-12-15T10:30:00Z', claimed: true, claimedAt: '2024-12-16T14:20:00Z', revoked: false },
  { id: '2', schemaName: 'Employee ID', recipientName: 'Bob Smith', recipientEmail: 'bob@example.com', issuedAt: '2024-12-14T09:15:00Z', claimed: false, revoked: false },
  { id: '3', schemaName: 'Course Completion', recipientName: 'Carol Davis', recipientEmail: 'carol@example.com', issuedAt: '2024-12-13T16:45:00Z', claimed: true, claimedAt: '2024-12-14T08:00:00Z', revoked: false },
  { id: '4', schemaName: 'University Degree', recipientName: 'David Wilson', recipientEmail: 'david@example.com', issuedAt: '2024-12-12T11:00:00Z', claimed: true, claimedAt: '2024-12-13T09:30:00Z', revoked: true, revokedAt: '2024-12-18T10:00:00Z' },
  { id: '5', schemaName: 'Professional Certificate', recipientName: 'Eve Brown', recipientEmail: 'eve@example.com', issuedAt: '2024-12-11T14:30:00Z', claimed: true, claimedAt: '2024-12-12T16:00:00Z', revoked: false },
  { id: '6', schemaName: 'Course Completion', recipientName: 'Frank Miller', recipientEmail: 'frank@example.com', issuedAt: '2024-12-10T08:45:00Z', claimed: false, revoked: false },
];

export default function CredentialsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  const [selectedCredential, setSelectedCredential] = React.useState<Credential | null>(null);
  const [showRevokeDialog, setShowRevokeDialog] = React.useState(false);
  const [isRevoking, setIsRevoking] = React.useState(false);

  const filteredCredentials = React.useMemo(() => {
    let filtered = mockCredentials;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.recipientName.toLowerCase().includes(query) ||
          c.recipientEmail.toLowerCase().includes(query) ||
          c.schemaName.toLowerCase().includes(query)
      );
    }

    // Filter by tab
    if (activeTab === 'claimed') {
      filtered = filtered.filter(c => c.claimed && !c.revoked);
    } else if (activeTab === 'pending') {
      filtered = filtered.filter(c => !c.claimed && !c.revoked);
    } else if (activeTab === 'revoked') {
      filtered = filtered.filter(c => c.revoked);
    }

    return filtered;
  }, [searchQuery, activeTab]);

  const getStatusBadge = (credential: Credential) => {
    if (credential.revoked) {
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Revoked
        </Badge>
      );
    }
    if (credential.claimed) {
      return (
        <Badge variant="success">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Claimed
        </Badge>
      );
    }
    return (
      <Badge variant="warning">
        <Clock className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    );
  };

  const columns: Column<Credential>[] = [
    {
      key: 'credential',
      header: 'Credential',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{row.schemaName}</p>
            <p className="text-xs text-muted-foreground">ID: {row.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'recipient',
      header: 'Recipient',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.recipientName}</p>
          <p className="text-xs text-muted-foreground">{row.recipientEmail}</p>
        </div>
      ),
    },
    {
      key: 'issuedAt',
      header: 'Issued',
      cell: (row) => <span className="text-muted-foreground">{formatDate(row.issuedAt)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => getStatusBadge(row),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[100px]',
      cell: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCredential(row);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {!row.revoked && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCredential(row);
                setShowRevokeDialog(true);
              }}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleRevoke = async () => {
    setIsRevoking(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Credential revoked successfully');
    setShowRevokeDialog(false);
    setSelectedCredential(null);
    setIsRevoking(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issued Credentials"
        description="View and manage all credentials you have issued."
        action={
          <Button asChild>
            <Link href="/issuer/issue">
              <Plus className="mr-2 h-4 w-4" />
              Issue Credential
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by recipient or credential type..."
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="claimed">Claimed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="revoked">Revoked</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredCredentials}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setSelectedCredential(row)}
        pagination={{
          page: 1,
          totalPages: 1,
          onPageChange: () => {},
        }}
      />

      {/* Revoke Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Credential</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this credential? This action will permanently mark the credential as invalid on the blockchain and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedCredential && (
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="font-medium">{selectedCredential.schemaName}</p>
              <p className="text-sm text-muted-foreground">
                Issued to {selectedCredential.recipientName}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevokeDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevoke}
              disabled={isRevoking}
            >
              {isRevoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                'Revoke Credential'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
