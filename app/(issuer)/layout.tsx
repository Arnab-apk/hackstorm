'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { AppShell } from '@/components/shared/app-shell';
import {
  LayoutDashboard,
  FilePlus,
  FileStack,
  FolderOpen,
  Settings,
  HelpCircle,
  Loader2,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/issuer', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Issue Credential', href: '/issuer/issue', icon: <FilePlus className="h-5 w-5" /> },
  { label: 'Batch Issue', href: '/issuer/batch', icon: <FileStack className="h-5 w-5" /> },
  { label: 'Credentials', href: '/issuer/credentials', icon: <FolderOpen className="h-5 w-5" /> },
];

const bottomNavItems = [
  { label: 'Settings', href: '/issuer/settings', icon: <Settings className="h-5 w-5" /> },
  { label: 'Help', href: '/issuer/help', icon: <HelpCircle className="h-5 w-5" /> },
];

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(json => json.data || json);

export default function IssuerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, error, isLoading } = useSWR('/api/auth/me', fetcher);

  React.useEffect(() => {
    if (error || (data && !data.address)) {
      router.push('/login');
    } else if (data && data.role !== 'issuer') {
      // Redirect to correct portal based on role
      const routes: Record<string, string> = {
        user: '/wallet',
        verifier: '/verifier',
      };
      router.push(routes[data.role] || '/login');
    }
  }, [data, error, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.address || data.role !== 'issuer') {
    return null;
  }

  const user = {
    name: data.email?.split('@')[0] || 'Issuer',
    email: data.email || data.address,
    role: 'issuer',
  };

  return (
    <AppShell
      sidebarTitle="CredVault"
      sidebarSubtitle="Issuer Portal"
      navItems={navItems}
      bottomNavItems={bottomNavItems}
      user={user}
      notificationCount={0}
    >
      {children}
    </AppShell>
  );
}
