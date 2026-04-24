import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Building2, PlusSquare, CalendarDays,
  ClipboardCheck, Wrench, ListChecks, UserCog, Bell,
  LogOut, ChevronDown, ChevronRight, Cpu, ShieldCheck, Home,
} from "lucide-react";
import { useState } from "react";
import logo from "../../assets/assetra_logo.png";

const MENU = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin/dashboard" },
  {
    label: "Resources", icon: Building2,
    children: [
      { label: "All Resources", icon: Cpu, href: "/admin/resources" },
      { label: "Add Resource", icon: PlusSquare, href: "/admin/resources/add" },
    ],
  },
  {
    label: "Bookings", icon: CalendarDays,
    children: [
      { label: "All Bookings", icon: ListChecks, href: "/admin/bookings" },
      { label: "Pending Approvals", icon: ClipboardCheck, href: "/admin/bookings/pending" },
    ],
  },
  {
    label: "Maintenance", icon: Wrench,
    children: [
      { label: "All Tickets", icon: ListChecks, href: "/admin/maintenance" },
      { label: "Assign Technician", icon: UserCog, href: "/admin/maintenance/assign" },
    ],
  },
  {
    label: "Management", icon: ShieldCheck,
    children: [
      { label: "User Management", icon: UserCog, href: "/admin/management/users" },
      { label: "Notifications", icon: Bell, href: "/admin/management/notifications" },
    ],
  },
];

const BOTTOM_MENU = [
  { label: "Go to Home", icon: Home, href: "/", external: true },
  { label: "Logout", icon: LogOut, href: "/admin/logout", danger: true },
];

function NavItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.href}
      end={item.href === "/"}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
        ${isActive && item.href !== "/"
          ? "text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10"
          : item.danger
          ? "text-red-400 hover:bg-red-500/10 hover:text-red-400"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-800 dark:hover:text-gray-200"
        }`
      }
    >
      <item.icon size={15} className="shrink-0" />
      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
    </NavLink>
  );
}

function NavGroup({ group, collapsed }) {
  const [open, setOpen] = useState(true);
  const { pathname } = useLocation();

  const isGroupActive = group.children?.some((child) => pathname.startsWith(child.href));

  return (
    <div>
      <button
        onClick={() => !collapsed && setOpen((p) => !p)}
        title={collapsed ? group.label : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold
          transition-all duration-150
          ${isGroupActive
            ? "text-orange-500 dark:text-orange-400"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white"
          }`}
      >
        <group.icon
          size={17}
          className={`shrink-0 transition-colors ${
            isGroupActive ? "text-orange-500 dark:text-orange-400" : "text-gray-400 dark:text-gray-500"
          }`}
        />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{group.label}</span>
            {open
              ? <ChevronDown size={13} className="text-gray-400 dark:text-gray-600" />
              : <ChevronRight size={13} className="text-gray-400 dark:text-gray-600" />
            }
          </>
        )}
      </button>

      {open && !collapsed && (
        <div className="mt-0.5 ml-4 pl-3 border-l border-gray-200 dark:border-white/[0.08] space-y-0.5">
          {group.children.map((child) => (
            <NavItem key={child.href} item={child} collapsed={collapsed} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminSidebar({ open, collapsed, onCollapsedChange }) {
  return (
    <aside
      className={`
        fixed top-0 left-0 z-30 h-screen
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-white/[0.06]
        flex flex-col
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-16" : "w-64"}
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* Logo + heading + collapse toggle */}
      <div className={`flex items-center px-3 py-4 border-b border-gray-200 dark:border-white/[0.06]
        ${collapsed ? "flex-col gap-3 justify-center" : "justify-between gap-3"}`}>

        <img
          src={logo}
          alt="Assetra"
          className="h-8 w-8 object-contain shrink-0 rounded-lg"
        />

        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            <p className="text-black dark:text-white font-bold text-base leading-tight truncate">
              Assetra
            </p>
            <p className="text-orange-400 text-[10px] font-mono tracking-widest uppercase truncate">
              Admin Panel
            </p>
          </div>
        )}

        <button
          onClick={() => onCollapsedChange((p) => !p)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors shrink-0"
        >
          {collapsed
            ? <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
            : <ChevronDown size={16} className="text-gray-400 dark:text-gray-500 rotate-90" />
          }
        </button>
      </div>

      {/* Scrollable nav */}
      <nav
        className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {MENU.map((item) =>
          item.children ? (
            <NavGroup key={item.label} group={item} collapsed={collapsed} />
          ) : (
            <NavItem key={item.href} item={item} collapsed={collapsed} />
          )
        )}
      </nav>

      {/* Bottom items */}
      <div className="px-2 py-3 border-t border-gray-200 dark:border-white/[0.06] space-y-0.5">
        {BOTTOM_MENU.map((item) => (
          <NavItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </div>

      {/* Version tag */}
      {!collapsed && (
        <div className="px-5 py-3 border-t border-gray-100 dark:border-white/[0.04]">
          <p className="text-[10px] text-gray-400 dark:text-gray-600 font-mono">
            v1.0.0 · IT3030 PAF 2026
          </p>
        </div>
      )}
    </aside>
  );
}