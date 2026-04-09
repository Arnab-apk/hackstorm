'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { AppShell } from '@/components/shared/app-shell';
import {
  Wallet,
  Inbox,
  Share2,
  History,
  Settings,
  HelpCircle,
  Loader2,
} from 'lucide-react';

const navItems = [
  { label: 'My Wallet', href: '/wallet', icon: <Wallet className="h-5 w-5" /> },
  { label: 'Inbox', href: '/wallet/inbox', icon: <Inbox className="h-5 w-5" /> },
  { label: 'Shared', href: '/wallet/shared', icon: <Share2 className="h-5 w-5" /> },
  { label: 'Activity', href: '/wallet/activity', icon: <History className="h-5 w-5" /> },
];

const bottomNavItems = [
  { label: 'Settings', href: '/wallet/settings', icon: <Settings className="h-5 w-5" /> },
  { label: 'Help', href: '/wallet/help', icon: <HelpCircle className="h-5 w-5" /> },
];

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function RecipientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, error, isLoading } = useSWR('/api/auth/me', fetcher);

  React.useEffect(() => {
    if (error || (data && !data.address)) {
      router.push('/login');
    } else if (data && data.role !== 'user') {
      // Redirect to correct portal based on role
      const routes: Record<string, string> = {
        issuer: '/issuer',
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

  if (!data?.address || data.role !== 'user') {
    return null;
  }

  const user = {
    name: data.email?.split('@')[0] || `${data.address.slice(0, 6)}...${data.address.slice(-4)}`,
    email: data.email || data.address,
    role: 'user',
  };

  return (
    <AppShell
      sidebarTitle="CredVault"
      sidebarSubtitle="My Wallet"
      navItems={navItems}
      bottomNavItems={bottomNavItems}
      user={user}
      notificationCount={0}
    >
      {children}
    </AppShell>
  );
}
