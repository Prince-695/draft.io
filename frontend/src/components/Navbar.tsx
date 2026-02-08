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
    <nav className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => router.push(ROUTES.DASHBOARD)}
              className="text-2xl font-bold text-blue-600"
            >
              Draft.io
            </button>
            
            <div className="hidden md:flex gap-6">
              <button
                onClick={() => router.push(ROUTES.DASHBOARD)}
                className="text-gray-700 hover:text-gray-900"
              >
                Feed
              </button>
              <button
                onClick={() => router.push(ROUTES.WRITE)}
                className="text-gray-700 hover:text-gray-900"
              >
                Write
              </button>
              <button
                onClick={() => router.push(ROUTES.CHAT)}
                className="text-gray-700 hover:text-gray-900"
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
              className="hidden md:block px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />

            {/* Theme Switcher */}
            <div className="hidden md:block">
              <ThemeSwitcher />
            </div>

            {/* Notifications */}
            <NotificationDropdown />

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border hidden group-hover:block">
                <button
                  onClick={() => router.push(`${ROUTES.PROFILE}/${user?.username}`)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-t-lg"
                >
                  Profile
                </button>
                <button
                  onClick={() => router.push(ROUTES.PROFILE_EDIT)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                >
                  Settings
                </button>
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600 rounded-b-lg"
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
