import { Sun, Moon, Bell, Search, ChevronDown } from "lucide-react";
import { useTheme } from "../../shared/context/ThemeContext";
import { useLocation } from "react-router-dom";

function usePageTitle() {
  const { pathname } = useLocation();
  const map = {
    "/technician/dashboard":         "My Dashboard",
    "/technician/tickets/assigned":  "Assigned to Me",
    "/technician/tickets/open":      "All Open Tickets",
    "/technician/tickets/resolved":  "Resolved Tickets",
    "/technician/resources":         "View Resources",
    "/technician/notifications":     "Notifications",
    "/technician/account/profile":   "My Profile",
  };
  return map[pathname] ?? "Technician";
}

export default function TechnicianHeader() {
  const { theme, toggleTheme } = useTheme();
  const pageTitle = usePageTitle();

  return (
    <header className="sticky top-0 z-10 h-16 flex items-center gap-4 px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-surface-border dark:border-white/[0.06]">
      <div className="flex-1 min-w-0">
        <h1 className="text-gray-900 dark:text-white font-display font-semibold text-lg leading-none truncate">
          {pageTitle}
        </h1>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5 font-mono">
          Smart Campus Operations Hub
        </p>
      </div>

      <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-muted dark:bg-white/5 border border-surface-border dark:border-white/[0.08] w-56 text-sm text-gray-400 cursor-pointer hover:border-red-400/50 transition-colors">
        <Search size={14} />
        <span>Quick search…</span>
        <kbd className="ml-auto text-[10px] bg-surface-border dark:bg-white/10 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
      </div>

      <button className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-surface-muted dark:hover:bg-white/8 transition-colors">
        <Bell size={19} />
      </button>

      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-surface-muted dark:hover:bg-white/8 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
      </button>

      <div className="flex items-center gap-2.5 pl-3 border-l border-surface-border dark:border-white/[0.08] cursor-pointer group">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-red-500/30">
          T
        </div>
        <div className="hidden sm:block leading-none">
          <p className="text-sm font-semibold text-gray-800 dark:text-white">Technician</p>
          <p className="text-[10px] text-red-400 font-mono">TECHNICIAN</p>
        </div>
        <ChevronDown size={13} className="text-gray-400 group-hover:text-red-400 transition-colors" />
      </div>
    </header>
  );
}