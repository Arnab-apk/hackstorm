'use client';

import { AppShell } from '@/components/shared/app-shell';
import {
  LayoutDashboard,
  FilePlus,
  FileStack,
  FolderOpen,
  Settings,
  HelpCircle,
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

// Mock user data - in production this would come from auth context
const mockUser = {
  name: 'Demo University',
  email: 'admin@university.edu',
  role: 'issuer',
};

export default function IssuerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      sidebarTitle="CredVault"
      sidebarSubtitle="Issuer Portal"
      navItems={navItems}
      bottomNavItems={bottomNavItems}
      user={mockUser}
      notificationCount={3}
    >
      {children}
    </AppShell>
  );
}
