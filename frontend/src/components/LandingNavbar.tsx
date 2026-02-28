'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { PenSquare, User, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/utils/constants';

export function LandingNavbar() {
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
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <PenSquare className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Draft.IO</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="#features" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link 
              href="#pricing" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          
          {user ? (
            /* User is logged in - show profile dropdown */
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push(ROUTES.DASHBOARD)}
              >
                Dashboard
              </Button>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary hover:ring-2 hover:ring-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {user.username?.charAt(0).toUpperCase()}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg z-50 py-1">
                    <button
                      onClick={() => handleNav(`${ROUTES.PROFILE}/${user.username}`)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => handleNav(ROUTES.PROFILE_EDIT)}
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
          ) : (
            /* User is not logged in - show sign in/signup buttons */
            <>
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
