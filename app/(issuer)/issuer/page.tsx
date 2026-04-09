'use client';

import * as React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CredentialCard } from '@/components/shared/credential-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Award,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  FileStack,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(json => json.data || json);

export default function IssuerDashboard() {
  const { data: statsData, error: statsError, isLoading: statsLoading } = useSWR('/api/issuer/stats', fetcher);
  const { data: credentialsData, error: credentialsError, isLoading: credentialsLoading } = useSWR('/api/issuer/credentials?pageSize=3', fetcher);
  const { data: batchesData, error: batchesError, isLoading: batchesLoading } = useSWR('/api/issuer/batches?pageSize=3', fetcher);

  const stats = statsData;
  const credentials = credentialsData?.credentials || [];
  const batches = batchesData?.batches || [];

  const statCards = [
    { label: 'Total Issued', value: stats?.totalCredentials?.toString() || '0', icon: <Award className="h-6 w-6" /> },
    { label: 'Total Batches', value: stats?.totalBatches?.toString() || '0', icon: <FileStack className="h-6 w-6" /> },
    { label: 'Claimed', value: stats?.claimedCredentials?.toString() || '0', icon: <CheckCircle2 className="h-6 w-6" /> },
    { label: 'Pending', value: stats?.unclaimedCredentials?.toString() || '0', icon: <Clock className="h-6 w-6" /> },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome back"
        description="Here's what's happening with your credentials today."
        action={
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/issuer/batch">
                <FileStack className="mr-2 h-4 w-4" />
                Batch Issue
              </Link>
            </Button>
            <Button asChild>
              <Link href="/issuer/issue">
                <Plus className="mr-2 h-4 w-4" />
                Issue Credential
              </Link>
            </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : statsError ? (
          <Card className="col-span-full">
            <CardContent className="p-4 flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              Failed to load statistics
            </CardContent>
          </Card>
        ) : (
          statCards.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Credentials */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Credentials</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/issuer/credentials">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {credentialsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : credentialsError ? (
            <Card>
              <CardContent className="p-4 flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                Failed to load credentials
              </CardContent>
            </Card>
          ) : credentials.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No credentials issued yet. Start by issuing your first credential.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {credentials.map((credential: any) => (
                <CredentialCard
                  key={credential._id}
                  credential={{
                    id: credential._id,
                    schemaId: credential.schemaId,
                    schemaName: credential.schemaName,
                    issuerName: 'You',
                    issuerDID: '',
                    issuedAt: credential.issuedAt,
                    claimed: credential.claimed,
                    claimedAt: credential.claimedAt,
                    revoked: credential.revoked,
                    recipientEmail: credential.recipientEmail,
                  }}
                  variant="compact"
                  showRecipient
                  onClick={() => {}}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Batches */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Batches</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/issuer/batches">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {batchesLoading ? (
                <div className="divide-y divide-border">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              ) : batchesError ? (
                <div className="p-4 flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Failed to load batches
                </div>
              ) : batches.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No batches created yet.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {batches.map((batch: any) => (
                    <div
                      key={batch._id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="font-medium text-sm">{batch.name || `Batch ${(batch._id || '').slice(0, 8)}`}</p>
                        <p className="text-xs text-muted-foreground">
                          {batch.credentialCount} credentials
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={batch.anchorStatus === 'confirmed' ? 'success' : 'warning'}>
                          {batch.anchorStatus === 'confirmed' ? 'Anchored' : 'Pending'}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(batch.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/issuer/issue"
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/50 transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Issue Single</p>
                <p className="text-xs text-muted-foreground">Create one credential</p>
              </div>
            </Link>
            <Link
              href="/issuer/batch"
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/50 transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FileStack className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Batch Issue</p>
                <p className="text-xs text-muted-foreground">Upload CSV for bulk</p>
              </div>
            </Link>
            <Link
              href="/issuer/credentials"
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/50 transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">View Analytics</p>
                <p className="text-xs text-muted-foreground">Track performance</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
