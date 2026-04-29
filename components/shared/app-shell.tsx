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
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        title={sidebarTitle}
        subtitle={sidebarSubtitle}
        navItems={navItems}
        bottomItems={bottomNavItems}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />
      <div className="lg:pl-64">
        <Header
          user={user}
          notificationCount={notificationCount}
          showSearch={showSearch}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export { AppShell };
