import { Sun, Moon, Bell, Search, ChevronDown } from "lucide-react";
import { useTheme } from "../../shared/context/ThemeContext";
import { useAuth } from "../../shared/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

function usePageTitle() {
  const { pathname } = useLocation();
  const map = {
    "/user/dashboard":          "Dashboard",
    "/user/resources":          "Browse Resources",
    "/user/bookings/new":       "Make a Booking",
    "/user/bookings":           "My Bookings",
    "/user/maintenance/report": "Report an Issue",
    "/user/maintenance":        "My Tickets",
    "/user/notifications":      "Notifications",
    "/user/account/profile":    "My Profile",
  };
  return map[pathname] ?? "Portal";
}

export default function UserHeader() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pageTitle = usePageTitle();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const firstLetter = user?.name?.[0]?.toUpperCase() ?? "U";
  const displayName = user?.name ?? "User";

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

      <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-muted dark:bg-white/5 border border-surface-border dark:border-white/[0.08] w-56 text-sm text-gray-400 cursor-pointer hover:border-amber-400/50 transition-colors">
        <Search size={14} />
        <span>Quick search…</span>
        <kbd className="ml-auto text-[10px] bg-surface-border dark:bg-white/10 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
      </div>

      <button
        onClick={() => navigate("/user/notifications")}
        className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-surface-muted dark:hover:bg-white/8 transition-colors">
        <Bell size={19} />
      </button>

      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-surface-muted dark:hover:bg-white/8 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
      </button>

      {/* User avatar + name + logout */}
      <div className="flex items-center gap-2.5 pl-3 border-l border-surface-border dark:border-white/[0.08]">
        {user?.picture ? (
          <img src={user.picture} alt={displayName}
            className="w-8 h-8 rounded-full object-cover shadow-md"/>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-amber-500/30">
            {firstLetter}
          </div>
        )}
        <div className="hidden sm:block leading-none cursor-pointer"
          onClick={() => navigate("/user/account/profile")}>
          <p className="text-sm font-semibold text-gray-800 dark:text-white">{displayName}</p>
          <p className="text-[10px] text-amber-400 font-mono">{user?.role ?? "USER"}</p>
        </div>
        <button
          onClick={handleLogout}
          className="ml-2 text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10">
          Logout
        </button>
      </div>
    </header>
  );
}