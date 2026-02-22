'use client';

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
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl hidden group-hover:block">
                  <button
                    onClick={() => router.push(`${ROUTES.PROFILE}/${user.username}`)}
                    className="w-full px-4 py-2 text-left hover:bg-accent rounded-t-lg text-foreground transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => router.push(ROUTES.PROFILE_EDIT)}
                    className="w-full px-4 py-2 text-left hover:bg-accent text-foreground transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left hover:bg-accent text-destructive rounded-b-lg transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
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
