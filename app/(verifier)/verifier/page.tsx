'use client';

import * as React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ScanLine,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Shield,
  Users,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function VerifierDashboard() {
  const { data: statsData, error: statsError, isLoading: statsLoading } = useSWR('/api/verifier/stats', fetcher);
  const { data: requestsData, error: requestsError, isLoading: requestsLoading } = useSWR('/api/verifier/requests?pageSize=5', fetcher);

  const stats = statsData?.data;
  const requests = requestsData?.data?.requests || [];

  const statCards = [
    { label: 'Total Requests', value: stats?.totalRequests?.toString() || '0', icon: <Shield className="h-6 w-6" /> },
    { label: 'Pending', value: stats?.pendingRequests?.toString() || '0', icon: <ClipboardList className="h-6 w-6" /> },
    { label: 'Approved', value: stats?.approvedRequests?.toString() || '0', icon: <CheckCircle2 className="h-6 w-6" /> },
    { label: 'Approval Rate', value: `${stats?.approvalRate || 0}%`, icon: <TrendingUp className="h-6 w-6" /> },
  ];

  // Separate pending and recent requests
  const pendingRequests = requests.filter((r: any) => r.status === 'pending');
  const recentResponses = requests.filter((r: any) => r.status !== 'pending');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Verifier Dashboard"
        description="Verify credentials and manage verification requests."
        action={
          <Button asChild>
            <Link href="/verifier/scan">
              <ScanLine className="mr-2 h-4 w-4" />
              Verify Credential
            </Link>
          </Button>
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
        {/* Recent Verifications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Responses</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/verifier/requests">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {requestsLoading ? (
                <div className="divide-y divide-border">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4">
                      <Skeleton className="h-14 w-full" />
                    </div>
                  ))}
                </div>
              ) : requestsError ? (
                <div className="p-4 flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Failed to load requests
                </div>
              ) : recentResponses.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No verification responses yet.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentResponses.map((request: any) => (
                    <div
                      key={request._id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            request.status === 'approved'
                              ? 'bg-success/10 text-success'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {request.status === 'approved' ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{request.credentialType || 'Credential Verification'}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.targetAddress?.slice(0, 8)}...{request.targetAddress?.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={request.status === 'approved' ? 'success' : 'destructive'}>
                          {request.status === 'approved' ? 'Approved' : 'Rejected'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(request.respondedAt || request.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pending Requests</h2>
            <Badge>{pendingRequests.length}</Badge>
          </div>
          <Card>
            <CardContent className="p-0">
              {requestsLoading ? (
                <div className="divide-y divide-border">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No pending requests.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {pendingRequests.map((request: any) => (
                    <div
                      key={request._id}
                      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{request.credentialType || 'Verification Request'}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {request.targetAddress?.slice(0, 10)}...
                          </p>
                        </div>
                        <Badge variant="warning" className="shrink-0">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Requested {formatDate(request.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/verifier/requests">
              View All Requests
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
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
              href="/verifier/scan"
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/50 transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ScanLine className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Scan QR Code</p>
                <p className="text-xs text-muted-foreground">Verify instantly</p>
              </div>
            </Link>
            <Link
              href="/verifier/requests/new"
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/50 transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">New Request</p>
                <p className="text-xs text-muted-foreground">Request credentials</p>
              </div>
            </Link>
            <Link
              href="/verifier/requests"
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/50 transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Analytics</p>
                <p className="text-xs text-muted-foreground">View statistics</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
