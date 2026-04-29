'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  bottomItems?: NavItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Sidebar({ title, subtitle, navItems, bottomItems, open = false, onOpenChange }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
    <div
      className={cn(
        'fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity lg:hidden',
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
      onClick={() => onOpenChange?.(false)}
    />
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-sidebar transition-transform lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">C</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-sidebar-hover hover:text-foreground lg:hidden"
            onClick={() => onOpenChange?.(false)}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'nav-item',
                  isActive && 'active'
                )}
                onClick={() => onOpenChange?.(false)}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        {bottomItems && bottomItems.length > 0 && (
          <div className="px-3 py-4 border-t border-border space-y-1">
            {bottomItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'nav-item',
                    isActive && 'active'
                  )}
                  onClick={() => onOpenChange?.(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </aside>
    </>
  );
}

export { Sidebar, type NavItem };
