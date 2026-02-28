'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Settings, LogOut, Bell, LayoutDashboard, Menu, X, Compass, PenLine, MessageCircle, LayoutGrid } from 'lucide-react';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/utils/constants';

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
    setMobileNavOpen(false);
    router.push(path);
  }

  const NAV_ITEMS = [
    { label: 'Feed', href: ROUTES.DASHBOARD, icon: LayoutGrid },
    { label: 'Explore', href: ROUTES.EXPLORE, icon: Compass },
    { label: 'Write', href: ROUTES.WRITE, icon: PenLine },
    { label: 'Chat', href: ROUTES.CHAT, icon: MessageCircle },
  ];

  return (
    <nav className="bg-background/95 border-b border-border sticky top-0 z-40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left: hamburger (mobile) + logo + desktop nav links */}
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileNavOpen((p) => !p)}
              className="md:hidden p-1.5 rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <button
              onClick={() => router.push(ROUTES.DASHBOARD)}
              className="text-2xl font-bold text-primary"
            >
              Draft.io
            </button>

            {/* Desktop nav links */}
            <div className="hidden md:flex gap-6 ml-4">
              {NAV_ITEMS.map(({ label, href }) => (
                <button
                  key={label}
                  onClick={() => router.push(href)}
                  className="text-foreground/70 hover:text-foreground transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Global Search — hide on very small screens */}
            <div className="hidden sm:block">
              <GlobalSearch />
            </div>

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

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="md:hidden border-t bg-background/98 px-4 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <button
              key={label}
              onClick={() => handleNav(href)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md hover:bg-accent transition-colors w-full text-left"
            >
              <Icon className="w-4 h-4 text-muted-foreground" />
              {label}
            </button>
          ))}
          {/* Show search on very small screens inside the mobile drawer */}
          <div className="sm:hidden mt-2 pt-2 border-t border-border">
            <GlobalSearch />
          </div>
        </div>
      )}
    </nav>
  );
}


