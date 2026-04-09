'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { AppShell } from '@/components/shared/app-shell';
import {
  LayoutDashboard,
  ScanLine,
  ClipboardList,
  History,
  Settings,
  HelpCircle,
  Loader2,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/verifier', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Verify', href: '/verifier/scan', icon: <ScanLine className="h-5 w-5" /> },
  { label: 'Requests', href: '/verifier/requests', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'History', href: '/verifier/history', icon: <History className="h-5 w-5" /> },
];

const bottomNavItems = [
  { label: 'Settings', href: '/verifier/settings', icon: <Settings className="h-5 w-5" /> },
  { label: 'Help', href: '/verifier/help', icon: <HelpCircle className="h-5 w-5" /> },
];

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(json => json.data || json);

export default function VerifierLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, error, isLoading } = useSWR('/api/auth/me', fetcher);

  React.useEffect(() => {
    if (error || (data && !data.address)) {
      router.push('/login');
    } else if (data && data.role !== 'verifier') {
      // Redirect to correct portal based on role
      const routes: Record<string, string> = {
        issuer: '/issuer',
        user: '/wallet',
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

  if (!data?.address || data.role !== 'verifier') {
    return null;
  }

  const user = {
    name: data.email?.split('@')[0] || 'Verifier',
    email: data.email || data.address,
    role: 'verifier',
  };

  return (
    <AppShell
      sidebarTitle="CredVault"
      sidebarSubtitle="Verifier Portal"
      navItems={navItems}
      bottomNavItems={bottomNavItems}
      user={user}
      notificationCount={0}
    >
      {children}
    </AppShell>
  );
}
