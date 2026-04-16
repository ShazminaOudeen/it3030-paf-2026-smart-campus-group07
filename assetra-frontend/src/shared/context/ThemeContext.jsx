// src/shared/context/ThemeContext.jsx
//
// HOW TO USE IN ANY MODULE:
//   import { useTheme } from '../../shared/context/ThemeContext';
//   const { theme, toggleTheme } = useTheme();
//
// In Tailwind JSX just use:   className="bg-white dark:bg-gray-900"
// The 'dark' class on <html> is managed automatically here.

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Read saved preference, fallback to OS preference
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("assetra-theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Apply / remove the 'dark' class on <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("assetra-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook — import this in any component
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}