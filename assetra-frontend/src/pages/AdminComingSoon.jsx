import { Construction, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Map route → friendly info
const PAGE_META = {
  "/admin/dashboard":                { label: "Overview Dashboard",   color: "from-orange-400 to-orange-600",  who: "Lead Member" },
  "/admin/resources":                { label: "All Resources",         color: "from-blue-400 to-blue-600",      who: "Member 1" },
  "/admin/resources/add":            { label: "Add Resource",          color: "from-blue-400 to-cyan-500",      who: "Member 1" },
  "/admin/bookings":                 { label: "All Bookings",          color: "from-purple-400 to-purple-600",  who: "Member 2" },
  "/admin/bookings/pending":         { label: "Pending Approvals",     color: "from-yellow-400 to-orange-500",  who: "Member 2" },
  "/admin/maintenance":              { label: "All Tickets",           color: "from-rose-400 to-rose-600",      who: "Member 3" },
  "/admin/maintenance/assign":       { label: "Assign Technician",     color: "from-rose-400 to-pink-600",      who: "Member 3" },
  "/admin/management/users":         { label: "User Management",       color: "from-teal-400 to-teal-600",      who: "Member 4" },
  "/admin/management/notifications": { label: "Notifications",         color: "from-teal-400 to-green-500",     who: "Member 4" },
  "/admin/account/profile":          { label: "My Profile",            color: "from-gray-400 to-gray-600",      who: "Lead Member" },
};

export default function AdminComingSoon() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] ?? { label: "This Page", color: "from-orange-400 to-orange-600", who: "A team member" };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] text-center px-4">
      {/* Icon blob */}
      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/20 animate-float`}>
        <Construction size={34} className="text-white" />
      </div>

      {/* Title */}
      <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {meta.label}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-base mb-1">
        This module is under construction.
      </p>
      <p className="text-orange-400 text-sm font-mono mb-8">
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
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-muted dark:bg-white/8 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 border border-surface-border dark:border-white/[0.08] transition-all"
      >
        <ArrowLeft size={15} />
        Go back
      </button>
    </div>
  );
}