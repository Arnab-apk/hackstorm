'use client';

import { AppShell } from '@/components/shared/app-shell';
import {
  LayoutDashboard,
  ScanLine,
  ClipboardList,
  History,
  Settings,
  HelpCircle,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/verifier', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Verify', href: '/verifier/scan', icon: <ScanLine className="h-5 w-5" /> },
  { label: 'Requests', href: '/verifier/requests', icon: <ClipboardList className="h-5 w-5" />, badge: 3 },
  { label: 'History', href: '/verifier/history', icon: <History className="h-5 w-5" /> },
];

const bottomNavItems = [
  { label: 'Settings', href: '/verifier/settings', icon: <Settings className="h-5 w-5" /> },
  { label: 'Help', href: '/verifier/help', icon: <HelpCircle className="h-5 w-5" /> },
];

// Mock user data
const mockUser = {
  name: 'TechCorp HR',
  email: 'hr@techcorp.com',
  role: 'verifier',
};

export default function VerifierLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      sidebarTitle="CredVault"
      sidebarSubtitle="Verifier Portal"
      navItems={navItems}
      bottomNavItems={bottomNavItems}
      user={mockUser}
      notificationCount={3}
    >
      {children}
    </AppShell>
  );
}
