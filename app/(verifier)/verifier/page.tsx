'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

// Mock data
const stats = [
  { label: 'Total Verifications', value: '3,842', icon: <Shield className="h-6 w-6" />, trend: { value: 18, isPositive: true } },
  { label: 'Active Requests', value: '12', icon: <ClipboardList className="h-6 w-6" /> },
  { label: 'Success Rate', value: '94%', icon: <CheckCircle2 className="h-6 w-6" />, trend: { value: 2, isPositive: true } },
  { label: 'Unique Holders', value: '1,247', icon: <Users className="h-6 w-6" />, trend: { value: 8, isPositive: true } },
];

const recentVerifications = [
  { id: '1', credentialType: 'University Degree', holderName: 'John Doe', verifiedAt: '2024-12-18T14:30:00Z', status: 'valid' as const },
  { id: '2', credentialType: 'AWS Certification', holderName: 'Jane Smith', verifiedAt: '2024-12-18T13:15:00Z', status: 'valid' as const },
  { id: '3', credentialType: 'Employee ID', holderName: 'Bob Wilson', verifiedAt: '2024-12-18T11:45:00Z', status: 'invalid' as const },
  { id: '4', credentialType: 'Professional License', holderName: 'Alice Brown', verifiedAt: '2024-12-18T10:20:00Z', status: 'valid' as const },
  { id: '5', credentialType: 'Course Completion', holderName: 'Charlie Davis', verifiedAt: '2024-12-18T09:00:00Z', status: 'valid' as const },
];

const pendingRequests = [
  { id: '1', credentialType: 'University Degree', recipientEmail: 'candidate1@email.com', requestedAt: '2024-12-17T10:00:00Z' },
  { id: '2', credentialType: 'Professional Certificate', recipientEmail: 'candidate2@email.com', requestedAt: '2024-12-16T15:30:00Z' },
  { id: '3', credentialType: 'Background Check', recipientEmail: 'candidate3@email.com', requestedAt: '2024-12-15T09:45:00Z' },
];

export default function VerifierDashboard() {
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
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Verifications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Verifications</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/verifier/history">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentVerifications.map((verification) => (
                  <div
                    key={verification.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          verification.status === 'valid'
                            ? 'bg-success/10 text-success'
                            : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {verification.status === 'valid' ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{verification.credentialType}</p>
                        <p className="text-sm text-muted-foreground">
                          {verification.holderName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={verification.status === 'valid' ? 'success' : 'destructive'}>
                        {verification.status === 'valid' ? 'Valid' : 'Invalid'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(verification.verifiedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="divide-y divide-border">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{request.credentialType}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {request.recipientEmail}
                        </p>
                      </div>
                      <Badge variant="warning" className="shrink-0">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Requested {formatDate(request.requestedAt)}
                    </p>
                  </div>
                ))}
              </div>
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
              href="/verifier/history"
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
