import { Construction, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const PAGE_META = {
  "/user/dashboard":          { label: "Overview Dashboard",  color: "from-blue-400 to-blue-600",     who: "Lead Member" },
  "/user/resources":          { label: "Browse Resources",    color: "from-cyan-400 to-blue-500",     who: "Member 1" },
  "/user/bookings/new":       { label: "Make a Booking",      color: "from-purple-400 to-purple-600", who: "Member 2" },
  "/user/bookings":           { label: "My Bookings",         color: "from-purple-400 to-pink-500",   who: "Member 2" },
  "/user/maintenance/report": { label: "Report an Issue",     color: "from-rose-400 to-rose-600",     who: "Member 3" },
  "/user/maintenance":        { label: "My Tickets",          color: "from-rose-400 to-orange-500",   who: "Member 3" },
  "/user/notifications":      { label: "Notifications",       color: "from-teal-400 to-green-500",    who: "Member 4" },
  "/user/account/profile":    { label: "My Profile",          color: "from-gray-400 to-gray-600",     who: "Lead Member" },
};

export default function UserComingSoon() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] ?? { label: "This Page", color: "from-blue-400 to-blue-600", who: "A team member" };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] text-center px-4">
      {/* Icon blob */}
      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20 animate-float`}>
        <Construction size={34} className="text-white" />
      </div>

      {/* Title */}
      <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {meta.label}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-base mb-1">
        This module is under construction.
      </p>
      <p className="text-blue-400 text-sm font-mono mb-8">
        Assigned to: {meta.who}
      </p>

      {/* Progress bar decoration */}
      <div className="w-64 h-1.5 rounded-full bg-surface-muted dark:bg-white/10 mb-8 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${meta.color} animate-pulse`}
          style={{ width: "40%" }}
        />
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-muted dark:bg-white/8 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 border border-surface-border dark:border-white/[0.08] transition-all"
      >
        <ArrowLeft size={15} />
        Go back
      </button>
    </div>
  );
}