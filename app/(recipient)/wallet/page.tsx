'use client';

import * as React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { PageHeader } from '@/components/shared/page-header';
import { CredentialCard } from '@/components/shared/credential-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Inbox,
  Award,
  Share2,
  Grid,
  List,
  AlertCircle,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function WalletPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  // Build the API URL based on active tab
  const statusParam = activeTab === 'active' ? 'claimed' : activeTab === 'revoked' ? 'revoked' : '';
  const apiUrl = `/api/recipient/credentials${statusParam ? `?status=${statusParam}` : ''}`;
  
  const { data, error, isLoading } = useSWR(apiUrl, fetcher);
  const { data: unclaimedData } = useSWR('/api/recipient/credentials?status=unclaimed', fetcher);

  const credentials = data?.credentials || [];
  const counts = data?.counts || { total: 0, claimed: 0, revoked: 0, unclaimed: 0 };
  const unclaimedCount = unclaimedData?.counts?.unclaimed || 0;

  const filteredCredentials = React.useMemo(() => {
    if (!searchQuery) return credentials;
    const query = searchQuery.toLowerCase();
    return credentials.filter(
      (c: any) =>
        c.schemaName?.toLowerCase().includes(query) ||
        c.schemaId?.toLowerCase().includes(query)
    );
  }, [credentials, searchQuery]);

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
                {unclaimedCount > 0 && (
                  <Badge className="ml-2" variant="default">{unclaimedCount}</Badge>
                )}
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
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{counts.total}</p>
              )}
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
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{counts.claimed}</p>
              )}
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
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{counts.unclaimed}</p>
              )}
              <p className="text-sm text-muted-foreground">Unclaimed</p>
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
              <TabsTrigger value="all">All ({counts.total})</TabsTrigger>
              <TabsTrigger value="active">Active ({counts.claimed})</TabsTrigger>
              <TabsTrigger value="revoked">Revoked ({counts.revoked})</TabsTrigger>
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
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Failed to load credentials. Please try again.
          </CardContent>
        </Card>
      ) : filteredCredentials.length === 0 ? (
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
          {filteredCredentials.map((credential: any) => (
            <CredentialCard
              key={credential.id}
              credential={{
                id: credential.id,
                schemaId: credential.schemaId,
                schemaName: credential.schemaName,
                issuerName: '', // TODO: Fetch from batch/issuer
                issuerDID: '',
                issuedAt: credential.issuedAt,
                claimed: credential.claimed,
                claimedAt: credential.claimedAt,
                revoked: credential.revoked,
              }}
              onClick={() => {}}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCredentials.map((credential: any) => (
            <CredentialCard
              key={credential.id}
              credential={{
                id: credential.id,
                schemaId: credential.schemaId,
                schemaName: credential.schemaName,
                issuerName: '',
                issuerDID: '',
                issuedAt: credential.issuedAt,
                claimed: credential.claimed,
                claimedAt: credential.claimedAt,
                revoked: credential.revoked,
              }}
              variant="compact"
              onClick={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
