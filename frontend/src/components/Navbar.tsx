'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Settings, LogOut, Bell, LayoutDashboard } from 'lucide-react';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/utils/constants';

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleNav(path: string) {
    setMenuOpen(false);
    router.push(path);
  }

  return (
    <nav className="bg-background/95 border-b border-border sticky top-0 z-40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => router.push(ROUTES.DASHBOARD)}
              className="text-2xl font-bold text-primary"
            >
              Draft.io
            </button>
            
            <div className="hidden md:flex gap-6">
              <button
                onClick={() => router.push(ROUTES.DASHBOARD)}
                className="text-foreground/70 hover:text-foreground transition-colors"
              >
                Feed
              </button>
              <button
                onClick={() => router.push(ROUTES.EXPLORE)}
                className="text-foreground/70 hover:text-foreground transition-colors"
              >
                Explore
              </button>
              <button
                onClick={() => router.push(ROUTES.WRITE)}
                className="text-foreground/70 hover:text-foreground transition-colors"
              >
                Write
              </button>
              <button
                onClick={() => router.push(ROUTES.CHAT)}
                className="text-foreground/70 hover:text-foreground transition-colors"
              >
                Chat
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Global Search */}
            <GlobalSearch />

            {/* Notifications */}
            <NotificationDropdown />

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary hover:ring-2 hover:ring-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary overflow-hidden"
              >
                {(user as any)?.profile_picture_url ? (
                  <Image
                    src={(user as any).profile_picture_url}
                    alt={user?.username || ''}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  user?.username?.charAt(0).toUpperCase()
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-popover border border-border rounded-md shadow-lg z-50 py-1">
                  {/* User info header */}
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-sm font-semibold text-foreground">{user?.full_name || user?.username}</p>
                    <p className="text-xs text-muted-foreground">@{user?.username}</p>
                  </div>
                  <button
                    onClick={() => handleNav(`${ROUTES.PROFILE}/${user?.username}`)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => handleNav(ROUTES.MY_POSTS)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleNav(ROUTES.SETTINGS)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={() => { setMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}


