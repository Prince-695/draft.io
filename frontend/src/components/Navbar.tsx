'use client';

import { useRouter } from 'next/navigation';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/utils/constants';

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

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
          <div className="flex items-center gap-4">
            {/* Search */}
            <input
              type="search"
              placeholder="Search..."
              className="hidden md:block px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-64 text-foreground placeholder:text-muted-foreground"
            />

            {/* Theme Switcher */}
            <div className="hidden md:block">
              <ThemeSwitcher />
            </div>

            {/* Notifications */}
            <NotificationDropdown />

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl hidden group-hover:block">
                <button
                  onClick={() => router.push(`${ROUTES.PROFILE}/${user?.username}`)}
                  className="w-full px-4 py-2 text-left hover:bg-accent rounded-t-lg text-foreground transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={() => router.push(ROUTES.PROFILE_EDIT)}
                  className="w-full px-4 py-2 text-left hover:bg-accent text-foreground transition-colors"
                >
                  Settings
                </button>
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left hover:bg-accent text-destructive rounded-b-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
