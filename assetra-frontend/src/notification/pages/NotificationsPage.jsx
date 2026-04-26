// src/notification/pages/NotificationsPage.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../shared/context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL;

// ── Notification type config ──
const TYPE_CONFIG = {
  BOOKING_APPROVED: {
    label: "Booking Approved",
    icon: "✅",
    color: "text-green-500",
    bg: "bg-green-500/10 border-green-500/20",
    dot: "bg-green-500",
    category: "BOOKING",
  },
  BOOKING_REJECTED: {
    label: "Booking Rejected",
    icon: "❌",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    dot: "bg-red-500",
    category: "BOOKING",
  },
  TICKET_UPDATED: {
    label: "Ticket Updated",
    icon: "🔧",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    dot: "bg-blue-500",
    category: "TICKET",
  },
  COMMENT_ADDED: {
    label: "New Comment",
    icon: "💬",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    dot: "bg-orange-500",
    category: "COMMENT",
  },
};

// ── Preference categories ──
const PREF_CATEGORIES = [
  {
    key: "BOOKING",
    label: "Booking Notifications",
    desc: "Approval and rejection updates for your bookings",
    icon: "📅",
  },
  {
    key: "TICKET",
    label: "Ticket Updates",
    desc: "Status changes on your maintenance tickets",
    icon: "🔧",
  },
  {
    key: "COMMENT",
    label: "Comment Alerts",
    desc: "New comments added to your tickets",
    icon: "💬",
  },
];

// ── User-specific storage key — fixes the shared-preferences bug ──
const getPrefKey = (userId) => `assetra-notif-prefs-${userId ?? "guest"}`;

function loadPrefs(userId) {
  try {
    const saved = localStorage.getItem(getPrefKey(userId));
    return saved
      ? JSON.parse(saved)
      : { BOOKING: true, TICKET: true, COMMENT: true };
  } catch {
    return { BOOKING: true, TICKET: true, COMMENT: true };
  }
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Single notification card ──
function NotificationCard({ notif, onMarkRead, onDelete }) {
  const cfg = TYPE_CONFIG[notif.type] ?? {
    label: notif.type, icon: "🔔", color: "text-gray-400",
    bg: "bg-gray-500/10 border-gray-500/20", dot: "bg-gray-400",
  };

  return (
    <div className={`relative flex gap-4 p-4 rounded-2xl border transition-all duration-200
      ${notif.read
        ? "bg-white dark:bg-gray-900/50 border-gray-100 dark:border-white/[0.06]"
        : `${cfg.bg} border`
      }`}>

      {/* Unread dot */}
      {!notif.read && (
        <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${cfg.dot}`}/>
      )}

      {/* Icon */}
      <div className="text-2xl flex-shrink-0 mt-0.5">{cfg.icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(notif.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {notif.message}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        {!notif.read && (
          <button
            onClick={() => onMarkRead(notif.id)}
            title="Mark as read"
            className="p-1.5 rounded-lg text-gray-400 hover:text-green-500
                       hover:bg-green-50 dark:hover:bg-green-500/10 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </button>
        )}
        <button
          onClick={() => onDelete(notif.id)}
          title="Delete"
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500
                     hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Preferences panel ──
function PreferencesPanel({ prefs, onChange }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/[0.08]
                    bg-white dark:bg-gray-900/50 p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">⚙️</span>
        <h2 className="text-sm font-bold text-gray-800 dark:text-white">Notification Preferences</h2>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Preferences are saved per account — changing them here only affects your login.
      </p>

      <div className="space-y-3">
        {PREF_CATEGORIES.map(cat => (
          <div key={cat.key}
            className="flex items-center justify-between p-3 rounded-xl
                       bg-gray-50 dark:bg-white/[0.03]
                       border border-gray-100 dark:border-white/[0.05]">
            <div className="flex items-center gap-3">
              <span className="text-lg">{cat.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{cat.label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{cat.desc}</p>
              </div>
            </div>

            {/* Toggle */}
            <button
              onClick={() => onChange(cat.key, !prefs[cat.key])}
              className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0
                ${prefs[cat.key] ? "bg-orange-500" : "bg-gray-200 dark:bg-gray-700"}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm
                              transition-transform duration-300
                              ${prefs[cat.key] ? "translate-x-5" : "translate-x-0.5"}`}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ──
export default function NotificationsPage() {
  const { token, user } = useAuth();
  const authHeader = { Authorization: `Bearer ${token}` };

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [activeTab, setActiveTab]         = useState("ALL");
  const [showPrefs, setShowPrefs]         = useState(false);

  // ── Load prefs per user ID — fixes the shared-preferences bug ──
  const [prefs, setPrefs] = useState(() => loadPrefs(user?.id));

  // Re-load prefs if user changes (e.g. different account same browser)
  useEffect(() => {
    setPrefs(loadPrefs(user?.id));
  }, [user?.id]);

  // ── Fetch notifications ──
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API}/notifications`, { headers: authHeader });
      setNotifications(data);
    } catch {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // ── Save prefs with user-specific key ──
  const handlePrefChange = (category, value) => {
    const updated = { ...prefs, [category]: value };
    setPrefs(updated);
    localStorage.setItem(getPrefKey(user?.id), JSON.stringify(updated));
  };

  // ── Filter by tab and preferences ──
  const filtered = notifications.filter(n => {
    const cfg = TYPE_CONFIG[n.type];
    const categoryEnabled = cfg ? prefs[cfg.category] !== false : true;
    const tabMatch = activeTab === "ALL" || !n.read;
    return categoryEnabled && tabMatch;
  });

  const unreadCount = notifications.filter(n => {
    const cfg = TYPE_CONFIG[n.type];
    return !n.read && (cfg ? prefs[cfg.category] !== false : true);
  }).length;

  // ── Mark single as read ──
  const handleMarkRead = async (id) => {
    try {
      await axios.put(`${API}/notifications/${id}/read`, {}, { headers: authHeader });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      alert("Failed to mark as read.");
    }
  };

  // ── Mark all as read ──
  const handleMarkAllRead = async () => {
    try {
      await axios.put(`${API}/notifications/read-all`, {}, { headers: authHeader });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      alert("Failed to mark all as read.");
    }
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/notifications/${id}`, { headers: authHeader });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      alert("Failed to delete notification.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead}
              className="text-xs font-medium text-orange-500 hover:text-orange-600
                         dark:text-orange-400 dark:hover:text-orange-300 transition">
              Mark all read
            </button>
          )}

          {/* Preferences toggle */}
          <button
            onClick={() => setShowPrefs(p => !p)}
            className={`p-2 rounded-xl border transition-all duration-200
              ${showPrefs
                ? "bg-orange-500 border-orange-500 text-white"
                : "border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-orange-400/50"
              }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </button>

          {/* Refresh */}
          <button onClick={fetchNotifications}
            className="p-2 rounded-xl border border-gray-200 dark:border-white/10
                       text-gray-500 dark:text-gray-400
                       hover:border-orange-400/50 transition-all duration-200">
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Preferences panel ── */}
      {showPrefs && <PreferencesPanel prefs={prefs} onChange={handlePrefChange}/>}

      {/* ── Tabs ── */}
      <div className="flex gap-2">
        {["ALL", "UNREAD"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200
              ${activeTab === tab
                ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20"
                : "bg-white dark:bg-gray-900/50 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-orange-400/40"
              }`}>
            {tab === "ALL" ? "All" : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={fetchNotifications}
            className="text-xs text-orange-500 hover:text-orange-600 underline">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="text-5xl">🔔</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {activeTab === "UNREAD" ? "No unread notifications" : "No notifications yet"}
          </p>
          <p className="text-gray-400 dark:text-gray-600 text-xs text-center max-w-xs">
            {activeTab === "UNREAD"
              ? "You're all caught up!"
              : "Notifications about bookings, tickets, and comments will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => (
            <NotificationCard
              key={n.id}
              notif={n}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-600">
          Showing {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}