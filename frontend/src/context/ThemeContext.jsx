import { createContext, useEffect, useState, useCallback } from 'react';
import { THEME_STORAGE_KEY } from '@/constants';

export const ThemeContext = createContext(null);

function getInitialTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'light';
}

/**
 * Scoped, additive theme toggle for the new Settings page. Applies a
 * `.dark` class to <html> that only the new auth/profile/settings
 * components opt into — existing dashboard pages are intentionally left
 * as-is so this doesn't turn into a full app redesign.
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next) => setThemeState(next), []);
  const toggleTheme = useCallback(() => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')), []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
