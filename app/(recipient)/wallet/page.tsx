'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { CredentialCard } from '@/components/shared/credential-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Search,
  Inbox,
  Award,
  Share2,
  Filter,
  Grid,
  List,
  QrCode,
} from 'lucide-react';

interface Credential {
  id: string;
  schemaId: string;
  schemaName: string;
  issuerName: string;
  issuerDID: string;
  issuedAt: string;
  claimed: boolean;
  claimedAt?: string;
  revoked: boolean;
}

// Mock credentials
const mockCredentials: Credential[] = [
  {
    id: '1',
    schemaId: 'university-degree',
    schemaName: 'Bachelor of Science',
    issuerName: 'Stanford University',
    issuerDID: 'did:web:stanford.edu',
    issuedAt: '2024-05-15T10:00:00Z',
    claimed: true,
    claimedAt: '2024-05-16T14:20:00Z',
    revoked: false,
  },
  {
    id: '2',
    schemaId: 'professional-cert',
    schemaName: 'AWS Solutions Architect',
    issuerName: 'Amazon Web Services',
    issuerDID: 'did:web:aws.amazon.com',
    issuedAt: '2024-08-20T09:00:00Z',
    claimed: true,
    claimedAt: '2024-08-21T11:30:00Z',
    revoked: false,
  },
  {
    id: '3',
    schemaId: 'course-completion',
    schemaName: 'Machine Learning Fundamentals',
    issuerName: 'Coursera',
    issuerDID: 'did:web:coursera.org',
    issuedAt: '2024-10-10T16:45:00Z',
    claimed: true,
    claimedAt: '2024-10-11T08:00:00Z',
    revoked: false,
  },
  {
    id: '4',
    schemaId: 'employee-id',
    schemaName: 'Employee Verification',
    issuerName: 'TechCorp Inc.',
    issuerDID: 'did:web:techcorp.com',
    issuedAt: '2024-01-05T11:00:00Z',
    claimed: true,
    claimedAt: '2024-01-06T09:30:00Z',
    revoked: true,
  },
];

export default function WalletPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  const filteredCredentials = React.useMemo(() => {
    let filtered = mockCredentials;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.schemaName.toLowerCase().includes(query) ||
          c.issuerName.toLowerCase().includes(query)
      );
    }

    if (activeTab === 'active') {
      filtered = filtered.filter(c => !c.revoked);
    } else if (activeTab === 'revoked') {
      filtered = filtered.filter(c => c.revoked);
    }

    return filtered;
  }, [searchQuery, activeTab]);

  const activeCount = mockCredentials.filter(c => !c.revoked).length;
  const revokedCount = mockCredentials.filter(c => c.revoked).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Credentials"
        description="View and manage your verifiable credentials."
        action={
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/wallet/inbox">
                <Inbox className="mr-2 h-4 w-4" />
                Inbox
                <Badge className="ml-2" variant="default">2</Badge>
              </Link>
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockCredentials.length}</p>
              <p className="text-sm text-muted-foreground">Total Credentials</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
              <Share2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Times Shared</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search credentials..."
              icon={<Search className="h-4 w-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({mockCredentials.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
              <TabsTrigger value="revoked">Revoked ({revokedCount})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2 border border-border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Credentials */}
      {filteredCredentials.length === 0 ? (
        <EmptyState
          icon={<Award className="h-8 w-8" />}
          title="No credentials found"
          description={searchQuery ? 'Try adjusting your search query.' : 'You haven\'t received any credentials yet.'}
          action={
            <Button asChild>
              <Link href="/wallet/inbox">Check Inbox</Link>
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCredentials.map((credential) => (
            <CredentialCard
              key={credential.id}
              credential={credential}
              onClick={() => {}}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCredentials.map((credential) => (
            <CredentialCard
              key={credential.id}
              credential={credential}
              variant="compact"
              onClick={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
