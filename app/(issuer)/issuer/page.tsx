'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CredentialCard } from '@/components/shared/credential-card';
import {
  Award,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  FileStack,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

// Mock data for dashboard
const stats = [
  { label: 'Total Issued', value: '1,247', icon: <Award className="h-6 w-6" />, trend: { value: 12, isPositive: true } },
  { label: 'Recipients', value: '892', icon: <Users className="h-6 w-6" />, trend: { value: 8, isPositive: true } },
  { label: 'Claimed', value: '756', icon: <CheckCircle2 className="h-6 w-6" />, trend: { value: 15, isPositive: true } },
  { label: 'Pending', value: '136', icon: <Clock className="h-6 w-6" /> },
];

const recentCredentials = [
  {
    id: '1',
    schemaId: 'university-degree',
    schemaName: 'University Degree',
    issuerName: 'Demo University',
    issuerDID: 'did:web:demo-university.edu',
    recipientName: 'Alice Johnson',
    recipientEmail: 'alice@example.com',
    issuedAt: '2024-12-15T10:30:00Z',
    claimed: true,
    claimedAt: '2024-12-16T14:20:00Z',
    revoked: false,
  },
  {
    id: '2',
    schemaId: 'employee-id',
    schemaName: 'Employee ID',
    issuerName: 'Demo University',
    issuerDID: 'did:web:demo-university.edu',
    recipientName: 'Bob Smith',
    recipientEmail: 'bob@example.com',
    issuedAt: '2024-12-14T09:15:00Z',
    claimed: false,
    revoked: false,
  },
  {
    id: '3',
    schemaId: 'course-completion',
    schemaName: 'Course Completion',
    issuerName: 'Demo University',
    issuerDID: 'did:web:demo-university.edu',
    recipientName: 'Carol Davis',
    recipientEmail: 'carol@example.com',
    issuedAt: '2024-12-13T16:45:00Z',
    claimed: true,
    claimedAt: '2024-12-14T08:00:00Z',
    revoked: false,
  },
];

const recentBatches = [
  { id: '1', name: 'Spring 2024 Graduates', count: 245, issuedAt: '2024-12-10T12:00:00Z', status: 'completed' },
  { id: '2', name: 'Employee Onboarding Dec', count: 32, issuedAt: '2024-12-08T10:00:00Z', status: 'completed' },
  { id: '3', name: 'Workshop Certificates', count: 78, issuedAt: '2024-12-05T14:00:00Z', status: 'completed' },
];

export default function IssuerDashboard() {
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
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
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
          <div className="space-y-3">
            {recentCredentials.map((credential) => (
              <CredentialCard
                key={credential.id}
                credential={credential}
                variant="compact"
                showRecipient
                onClick={() => {}}
              />
            ))}
          </div>
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
              <div className="divide-y divide-border">
                {recentBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-sm">{batch.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {batch.count} credentials
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="success" className="mb-1">Completed</Badge>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(batch.issuedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
