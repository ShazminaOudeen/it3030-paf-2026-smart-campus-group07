import { Sun, Moon, Bell, Search, ChevronDown } from "lucide-react";
import { useTheme } from "../../shared/context/ThemeContext";
import { useAuth } from "../../shared/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getUserDisplayName, getUserAvatar, getUserEmail } from "../../shared/utils/userHelpers";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function TechnicianHeader() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const displayName = getUserDisplayName(user);
  const avatarUrl = getUserAvatar(user);
  const userEmail = getUserEmail(user);
  const firstLetter = displayName[0].toUpperCase();

  return (
    <header className="sticky top-0 z-10 h-16 flex items-center gap-4 px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-surface-border dark:border-white/[0.06]">

      <div className="flex-1 min-w-0">
        <h1 className="text-gray-900 dark:text-white font-display font-semibold text-lg leading-none truncate">
          {getGreeting()}, {displayName} 👋
        </h1>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5 font-mono">
          Smart Campus Operations Hub
        </p>
      </div>

      <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-muted dark:bg-white/5 border border-surface-border dark:border-white/[0.08] w-56 text-sm text-gray-400 cursor-pointer hover:border-blue-400/50 transition-colors">
        <Search size={14} />
        <span>Quick search…</span>
        <kbd className="ml-auto text-[10px] bg-surface-border dark:bg-white/10 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
      </div>

      <button className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-surface-muted dark:hover:bg-white/8 transition-colors">
        <Bell size={19} />
      </button>

      <button onClick={toggleTheme}
        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-surface-muted dark:hover:bg-white/8 transition-colors"
        aria-label="Toggle theme">
        {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
      </button>

      <div className="relative">
        <div onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 pl-3 border-l border-surface-border dark:border-white/[0.08] cursor-pointer group">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover"/>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/30">
              {firstLetter}
            </div>
          )}
          <div className="hidden sm:block leading-none">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{displayName}</p>
            <p className="text-[10px] text-blue-400 font-mono">TECHNICIAN</p>
          </div>
          <ChevronDown size={13} className={`text-gray-400 group-hover:text-blue-400 transition-all duration-200 ${dropdownOpen ? "rotate-180" : ""}`}/>
        </div>

        {dropdownOpen && (
          <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-white/8">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            </div>
            <div className="py-1">
              <button onClick={handleLogout}
                className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}