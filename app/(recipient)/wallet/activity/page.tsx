'use client';

import * as React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  FileCheck2,
  Inbox,
  RefreshCw,
  Share2,
  ShieldAlert,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(json => json.data || json);

const activityMeta: Record<string, { icon: React.ElementType; variant: 'default' | 'success' | 'warning' | 'destructive' | 'muted'; label: string }> = {
  credential_issued: { icon: FileCheck2, variant: 'success', label: 'Credential' },
  credential_revoked: { icon: ShieldAlert, variant: 'destructive', label: 'Revoked' },
  verification_request: { icon: Inbox, variant: 'warning', label: 'Request' },
  request_approved: { icon: CheckCircle2, variant: 'success', label: 'Approved' },
  request_rejected: { icon: AlertCircle, variant: 'destructive', label: 'Rejected' },
  request_expired: { icon: Clock, variant: 'muted', label: 'Expired' },
};

function getActivityHref(activity: any) {
  const credentialId = activity.data?.credentialId;
  const requestId = activity.data?.requestId;

  if (credentialId) return `/wallet/credentials/${credentialId}`;
  if (requestId) return `/wallet/requests/${requestId}`;
  return '/wallet';
}

export default function WalletActivityPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/recipient/notifications?limit=50', fetcher);
  const [markingRead, setMarkingRead] = React.useState(false);

  const activities = data?.notifications || [];
  const unread = data?.unread || 0;

  const markAllRead = async () => {
    setMarkingRead(true);
    try {
      await fetch('/api/recipient/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      });
      await mutate();
    } finally {
      setMarkingRead(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description="Track credential issues, verification requests, revocations, and sharing updates."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => mutate()}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={markAllRead} disabled={markingRead || unread === 0}>
              <CheckCircle2 className="h-4 w-4" />
              Mark all read
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-md bg-primary/10 p-3 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{data?.total || 0}</p>
              <p className="text-sm text-muted-foreground">Total events</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-md bg-warning/10 p-3 text-warning">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{unread}</p>
              <p className="text-sm text-muted-foreground">Unread</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-md bg-success/10 p-3 text-success">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{activities.filter((item: any) => item.type === 'verification_request').length}</p>
              <p className="text-sm text-muted-foreground">Requests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="p-4">
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 p-8 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Failed to load activity.
            </div>
          ) : activities.length === 0 ? (
            <EmptyState
              icon={<Bell className="h-8 w-8" />}
              title="No activity yet"
              description="Credential and verification events will appear here after you receive or share credentials."
              action={
                <Button asChild>
                  <Link href="/wallet/inbox">Check Inbox</Link>
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-border">
              {activities.map((activity: any) => {
                const meta = activityMeta[activity.type] || { icon: Bell, variant: 'muted' as const, label: 'Activity' };
                const Icon = meta.icon;

                return (
                  <Link
                    key={activity.id}
                    href={getActivityHref(activity)}
                    className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/45"
                  >
                    <div className="mt-1 rounded-md bg-muted p-2 text-muted-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{activity.title}</p>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                        {!activity.read && <Badge variant="default">New</Badge>}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{activity.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(activity.createdAt)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
