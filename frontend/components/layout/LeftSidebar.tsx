'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, MessageSquare, FileText, BookOpen, User, Pill, Image, ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'medichat-sidebar-collapsed';

export function LeftSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [featuresExpanded, setFeaturesExpanded] = useState(false);

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Resources', href: '/resources', icon: BookOpen },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const featuresItems = [
    { name: 'Medicine Info', href: '/features/medicine', icon: 'pill' },
    { name: 'Medical Image Analysis', href: '/features/rash-detection', icon: 'image' },
  ];

  // Load collapsed state from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch (error) {
      console.error('Failed to load sidebar state:', error);
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    try {
      localStorage.setItem(STORAGE_KEY, String(newState));
    } catch (error) {
      console.error('Failed to save sidebar state:', error);
    }
  };

  // Close mobile sidebar on navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-dark-secondary border-r border-gray-200 dark:border-dark-border flex flex-col z-50 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Logo/Brand */}
        <div className={`p-6 border-b border-gray-200 dark:border-dark-border ${isCollapsed ? 'px-4' : ''}`}>
          <Link href="/" className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🏥</span>
            </div>
            {!isCollapsed && (
              <span className="text-xl font-semibold text-black dark:text-white">MediChat</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.name}</span>}
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {item.name}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}

            {/* Features Section */}
            <li className="pt-4 mt-4 border-t border-gray-200 dark:border-dark-border">
              <button
                onClick={() => setFeaturesExpanded(!featuresExpanded)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface ${
                  isCollapsed ? 'justify-center' : ''
                }`}
                title={isCollapsed ? 'Features' : undefined}
              >
                <BookOpen className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="font-medium flex-1 text-left">Features</span>
                    {featuresExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </>
                )}
              </button>

              {/* Features Submenu */}
              {featuresExpanded && !isCollapsed && (
                <ul className="mt-2 ml-4 space-y-1">
                  <li>
                    <Link
                      href="/features/medicine"
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                        pathname === '/features/medicine'
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-surface'
                      }`}
                    >
                      <Pill className="w-4 h-4" />
                      <span className="text-sm font-medium">Medicine Info</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/features/rash-detection"
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                        pathname === '/features/rash-detection'
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-surface'
                      }`}
                    >
                      <Image className="w-4 h-4" />
                      <span className="text-sm font-medium">Medical Image Analysis</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className={`p-4 border-t border-gray-200 dark:border-dark-border ${isCollapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-dark-surface ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold flex-shrink-0">
              AK
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  Aarav Kumar
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  aarav@example.com
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile toggle button - expose for header to use */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-lg bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex items-center justify-center"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
}
