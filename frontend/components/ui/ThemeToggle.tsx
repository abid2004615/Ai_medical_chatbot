'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-surface-light transition-all"
        aria-label="Toggle theme"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-surface-light transition-all group"
      aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {resolvedTheme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300 transition-transform group-hover:rotate-12" />
      ) : (
        <Sun className="w-5 h-5 text-gray-300 dark:text-gray-300 transition-transform group-hover:rotate-45" />
      )}
    </button>
  );
}
