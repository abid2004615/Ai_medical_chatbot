'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'medichat-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Get system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Resolve the actual theme to apply
  const resolveTheme = (themeValue: Theme): 'light' | 'dark' => {
    if (themeValue === 'system') {
      return getSystemTheme();
    }
    return themeValue;
  };

  // Apply theme to document
  const applyTheme = (themeValue: 'light' | 'dark') => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(themeValue);
    setResolvedTheme(themeValue);
  };

  // Set theme and persist to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
    const resolved = resolveTheme(newTheme);
    applyTheme(resolved);
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);

    // Load saved theme or detect system preference
    let savedTheme: Theme = 'system';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        savedTheme = stored;
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }

    setThemeState(savedTheme);
    const resolved = resolveTheme(savedTheme);
    applyTheme(resolved);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const newResolved = getSystemTheme();
        applyTheme(newResolved);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update resolved theme when theme changes
  useEffect(() => {
    if (mounted) {
      const resolved = resolveTheme(theme);
      applyTheme(resolved);
    }
  }, [theme, mounted]);

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
