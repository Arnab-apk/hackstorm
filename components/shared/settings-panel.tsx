'use client';

import * as React from 'react';
import useSWR from 'swr';
import { Check, Copy, KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { truncateAddress, truncateDID } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(json => json.data || json);

interface SettingsPanelProps {
  portalName: string;
  description: string;
  capabilities: string[];
}

function SettingRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-b-0">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function SettingsPanel({ portalName, description, capabilities }: SettingsPanelProps) {
  const { data, isLoading } = useSWR('/api/auth/me', fetcher);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [settings, setSettings] = React.useState({
    notifications: true,
    compactView: false,
    verificationWarnings: true,
  });

  const copyValue = async (key: string, value?: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1400);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={`${portalName} Settings`} description={description} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="h-4 w-4 text-primary" />
                Connected Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  <div className="rounded-md border border-border bg-muted/30 p-4">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <p className="text-xs uppercase text-muted-foreground">Wallet Address</p>
                      <Button variant="ghost" size="icon-sm" onClick={() => copyValue('address', data?.address)}>
                        {copied === 'address' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="break-all font-mono text-sm">{data?.address || 'Not connected'}</p>
                  </div>

                  <div className="rounded-md border border-border bg-muted/30 p-4">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <p className="text-xs uppercase text-muted-foreground">DID</p>
                      <Button variant="ghost" size="icon-sm" onClick={() => copyValue('did', data?.did)}>
                        {copied === 'did' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="break-all font-mono text-sm">{data?.did || 'Unavailable'}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border border-border bg-muted/30 p-4">
                      <p className="text-xs uppercase text-muted-foreground">Role</p>
                      <Badge className="mt-2 capitalize">{data?.role || 'unknown'}</Badge>
                    </div>
                    <div className="rounded-md border border-border bg-muted/30 p-4">
                      <p className="text-xs uppercase text-muted-foreground">Email</p>
                      <p className="mt-2 truncate text-sm">{data?.email || 'Not provided'}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4 text-primary" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SettingRow
                title="Product notifications"
                description="Show credential, request, and verification updates in the app."
                checked={settings.notifications}
                onCheckedChange={(notifications) => setSettings(current => ({ ...current, notifications }))}
              />
              <SettingRow
                title="Compact dashboard layout"
                description="Prefer denser cards and tables when viewing operational screens."
                checked={settings.compactView}
                onCheckedChange={(compactView) => setSettings(current => ({ ...current, compactView }))}
              />
              <SettingRow
                title="Verification warnings"
                description="Highlight mocked services and incomplete trust checks during the MVP."
                checked={settings.verificationWarnings}
                onCheckedChange={(verificationWarnings) => setSettings(current => ({ ...current, verificationWarnings }))}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Portal Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 rounded-md border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase text-muted-foreground">Current session</p>
                <p className="mt-2 text-sm">{data?.address ? truncateAddress(data.address, 6) : 'Loading session...'}</p>
                <p className="mt-1 text-xs text-muted-foreground">{data?.did ? truncateDID(data.did) : 'DID unavailable'}</p>
              </div>
              <div className="space-y-2">
                {capabilities.map((capability) => (
                  <div key={capability} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-success" />
                    {capability}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">MVP Notice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                These preferences are local UI controls for now. Persisting user preferences should be added with a dedicated profile API when the product moves beyond the demo stage.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
