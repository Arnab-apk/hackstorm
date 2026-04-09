'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bell, Search, LogOut, User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  notificationCount?: number;
  showSearch?: boolean;
}

function Header({ user, notificationCount = 0, showSearch = true }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
      {/* Search */}
      {showSearch && (
        <div className="w-full max-w-md">
          <Input
            placeholder="Search..."
            icon={<Search className="h-4 w-4" />}
            className="bg-muted border-transparent focus:bg-input"
          />
        </div>
      )}

      {!showSearch && <div />}

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          type="button"
          className={cn(
            'relative rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
            notificationCount > 0 && 'pulse-dot'
          )}
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* User Dropdown */}
        {user && (
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted transition-colors"
            >
              <Avatar fallback={user.name} src={user.avatar} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <ChevronDown
                className={cn(
                  'hidden md:block h-4 w-4 text-muted-foreground transition-transform',
                  dropdownOpen && 'rotate-180'
                )}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-popover p-1 shadow-lg animate-scale-in">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => {
                    setDropdownOpen(false);
                    // TODO: Handle logout
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export { Header };
