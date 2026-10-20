import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always default to 'dark' to restore the original dark cyber-brutalist palette
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('app_theme');
      } catch (e) {}
    }
    return 'dark';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState('dark');
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('app_theme', 'dark');
      } catch (e) {}
    }
  };

  const toggleTheme = () => {
    // Theme is locked to original dark cyber-brutalist palette
    setTheme('dark');
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.remove('theme-light');
      document.documentElement.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme: 'dark',
        toggleTheme,
        setTheme,
        isLight: false,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
