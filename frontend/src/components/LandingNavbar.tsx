'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { PenSquare, User, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/utils/constants';

export function LandingNavbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
    setMobileOpen(false);
    router.push(path);
  }

  const NAV_LINKS = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Feed', href: ROUTES.FEED },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: logo + hamburger (mobile) + desktop nav links */}
        <div className="flex items-center gap-4">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="md:hidden p-1.5 rounded-md hover:bg-accent transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <PenSquare className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Draft.IO</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 ml-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: theme switcher + auth */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />

          {user ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="hidden sm:flex"
                onClick={() => router.push(ROUTES.DASHBOARD)}
              >
                Dashboard
              </Button>
              {/* Profile dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary hover:ring-2 hover:ring-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {user.username?.charAt(0).toUpperCase()}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-popover border border-border rounded-md shadow-lg z-50 py-1">
                    <button
                      onClick={() => handleNav(`${ROUTES.PROFILE}/${user.username}`)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
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
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background/98 px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium rounded-md hover:bg-accent transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <>
              <div className="my-1 h-px bg-border" />
              <button
                onClick={() => handleNav(ROUTES.DASHBOARD)}
                className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-md hover:bg-accent transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNav(`${ROUTES.PROFILE}/${user.username}`)}
                className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-md hover:bg-accent transition-colors"
              >
                Profile
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
