'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, User, Search, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/chat': 'Chat',
  '/reports': 'Reports',
  '/resources': 'Resources',
  '/profile': 'Profile',
  '/auth': 'Authentication',
};

export function MinimalHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('session_token');
    setSessionToken(token);
  }, []);

  const pageTitle = PAGE_TITLES[pathname] || 'MediChat';

  if (!mounted) {
    return null;
  }

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-border flex items-center justify-between px-6 z-20">
      {/* Left side - Page title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {pageTitle}
        </h1>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        {/* Search bar - desktop only */}
        <div className="hidden md:flex items-center relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-64 px-4 py-2 pl-10 rounded-lg bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <Search className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute left-3" />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
            title="Profile"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-border rounded-lg shadow-lg py-2 z-20">
                <button
                  onClick={() => {
                    router.push('/profile');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <div className="h-px bg-gray-200 dark:bg-dark-border my-2" />
                <button
                  onClick={() => {
                    localStorage.removeItem('session_token');
                    router.push('/auth');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors flex items-center gap-2"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
