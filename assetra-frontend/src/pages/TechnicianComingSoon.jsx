import { Construction, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const PAGE_META = {
  "/technician/dashboard":         { label: "My Dashboard",       color: "from-emerald-400 to-emerald-600",  who: "Member 3" },
  "/technician/tickets/assigned":  { label: "Assigned to Me",     color: "from-emerald-400 to-teal-500",     who: "Member 3" },
  "/technician/tickets/open":      { label: "All Open Tickets",   color: "from-teal-400 to-cyan-500",        who: "Member 3" },
  "/technician/tickets/resolved":  { label: "Resolved Tickets",   color: "from-cyan-400 to-blue-500",        who: "Member 3" },
  "/technician/resources":         { label: "View Resources",     color: "from-blue-400 to-indigo-500",      who: "Member 1" },
  "/technician/notifications":     { label: "Notifications",      color: "from-teal-400 to-green-500",       who: "Member 4" },
  "/technician/account/profile":   { label: "My Profile",         color: "from-gray-400 to-gray-600",        who: "Lead Member" },
};

export default function TechnicianComingSoon() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] ?? { label: "This Page", color: "from-emerald-400 to-emerald-600", who: "A team member" };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] text-center px-4">
      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20 animate-float`}>
        <Construction size={34} className="text-white" />
      </div>

      <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {meta.label}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-base mb-1">
        This module is under construction.
      </p>
      <p className="text-emerald-400 text-sm font-mono mb-8">
        Assigned to: {meta.who}
      </p>

      <div className="w-64 h-1.5 rounded-full bg-surface-muted dark:bg-white/10 mb-8 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${meta.color} animate-pulse`}
          style={{ width: "40%" }}
        />
      </div>

      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-muted dark:bg-white/8 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 border border-surface-border dark:border-white/[0.08] transition-all"
      >
        <ArrowLeft size={15} />
        Go back
      </button>
    </div>
  );
}