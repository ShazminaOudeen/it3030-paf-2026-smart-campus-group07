import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ROLES = [
  {
    key: "user",
    label: "User",
    sub: "Students, Teachers & Staff",
    badge: "MOST POPULAR",
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    iconColor: "bg-orange-500",
    borderColor: "hover:border-orange-500/50",
    glowColor: "hover:shadow-orange-500/10",
    linkColor: "text-orange-400 group-hover:text-orange-300",
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    ),
    perms: ["Book facilities & resources", "Report incidents & faults", "Track booking status", "Receive notifications", "View campus resources", "Submit maintenance requests"],
    to: "/login/user",
  },
  {
    key: "technician",
    label: "Technician",
    sub: "Maintenance & Support Staff",
    badge: "OPERATOR",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    iconColor: "bg-blue-500",
    borderColor: "hover:border-blue-500/50",
    glowColor: "hover:shadow-blue-500/10",
    linkColor: "text-blue-400 group-hover:text-blue-300",
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
    perms: ["View assigned tickets", "Update ticket status", "Add resolution notes", "Upload evidence photos", "Communicate with users", "Mark tickets as resolved"],
    to: "/login/technician",
  },
  {
    key: "admin",
    label: "Admin",
    sub: "System Administrators",
    badge: "SYSTEM",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    iconColor: "bg-purple-600",
    borderColor: "hover:border-purple-500/50",
    glowColor: "hover:shadow-purple-500/10",
    linkColor: "text-purple-400 group-hover:text-purple-300",
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    perms: ["Approve/reject bookings", "Manage facility catalogue", "Oversee all tickets", "Manage user roles", "View system analytics", "Add new administrators"],
    to: "/login/admin",
  },
];

export default function LoginPortalPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden transition-colors duration-300">

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"/>
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",backgroundSize:"60px 60px"}}/>

      {/* Top nav bar */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center px-6 py-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform"/>
          Back to Home
        </button>
      </div>

      <div className="relative z-10 w-full max-w-6xl">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="text-gray-900 dark:text-white font-bold text-lg">Assetra</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Who are you{" "}
            <span className="text-orange-500 relative">
              logging in
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none" preserveAspectRatio="none">
                <path d="M2 6 C50 2, 120 2, 198 5" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
              </svg>
            </span>
            {" "}as?
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto">
            Select your role to access your personalised dashboard and tools.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ROLES.map((role) => (
            <Link
              key={role.key}
              to={role.to}
              className={`group relative bg-gray-50 dark:bg-[#0f0f1a] border border-gray-200 dark:border-white/8 rounded-2xl p-6
                         hover:shadow-2xl ${role.glowColor}
                         ${role.borderColor}
                         transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Shimmer top line */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gray-300/50 dark:via-white/10 to-transparent"/>

              {/* Badge */}
              <div className="flex justify-between items-start mb-5">
                <div className={`w-14 h-14 rounded-2xl ${role.iconColor} flex items-center justify-center shadow-lg`}>
                  {role.icon}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${role.badgeColor}`}>
                  {role.badge}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{role.label}</h3>
              <p className="text-gray-500 text-sm mb-5">{role.sub}</p>

              {/* Divider */}
              <div className="h-px bg-gray-200 dark:bg-white/5 mb-5"/>

              {/* Permissions */}
              <ul className="space-y-2 mb-6">
                {role.perms.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    {p}
                  </li>
                ))}
              </ul>

              {/* Login link */}
              <div className={`flex items-center gap-2 text-sm font-semibold ${role.linkColor} transition-all duration-200`}>
                Login as {role.label}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-gray-400 dark:text-gray-600 text-xs mt-10">
          Assetra © 2026 · Smart Campus Operations Hub
        </p>
      </div>
    </div>
  );
}