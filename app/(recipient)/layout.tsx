'use client';

import { AppShell } from '@/components/shared/app-shell';
import {
  Wallet,
  Inbox,
  Share2,
  History,
  Settings,
  HelpCircle,
} from 'lucide-react';

const navItems = [
  { label: 'My Wallet', href: '/wallet', icon: <Wallet className="h-5 w-5" /> },
  { label: 'Inbox', href: '/wallet/inbox', icon: <Inbox className="h-5 w-5" />, badge: 2 },
  { label: 'Shared', href: '/wallet/shared', icon: <Share2 className="h-5 w-5" /> },
  { label: 'Activity', href: '/wallet/activity', icon: <History className="h-5 w-5" /> },
];

const bottomNavItems = [
  { label: 'Settings', href: '/wallet/settings', icon: <Settings className="h-5 w-5" /> },
  { label: 'Help', href: '/wallet/help', icon: <HelpCircle className="h-5 w-5" /> },
];

// Mock user data
const mockUser = {
  name: 'Alice Johnson',
  email: 'alice@example.com',
  role: 'recipient',
};

export default function RecipientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      sidebarTitle="CredVault"
      sidebarSubtitle="My Wallet"
      navItems={navItems}
      bottomNavItems={bottomNavItems}
      user={mockUser}
      notificationCount={2}
    >
      {children}
    </AppShell>
  );
}
