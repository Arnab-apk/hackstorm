'use client';

import * as React from 'react';
import { Sidebar, type NavItem } from './sidebar';
import { Header } from './header';

interface AppShellProps {
  children: React.ReactNode;
  sidebarTitle: string;
  sidebarSubtitle?: string;
  navItems: NavItem[];
  bottomNavItems?: NavItem[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  notificationCount?: number;
  showSearch?: boolean;
}

function AppShell({
  children,
  sidebarTitle,
  sidebarSubtitle,
  navItems,
  bottomNavItems,
  user,
  notificationCount,
  showSearch,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        title={sidebarTitle}
        subtitle={sidebarSubtitle}
        navItems={navItems}
        bottomItems={bottomNavItems}
      />
      <div className="pl-64">
        <Header
          user={user}
          notificationCount={notificationCount}
          showSearch={showSearch}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export { AppShell };
