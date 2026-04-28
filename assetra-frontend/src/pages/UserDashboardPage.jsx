import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../shared/context/AuthContext";

// ── Icons (inline SVG to avoid lucide dependency issues) ──────────────────────
const Icon = ({ d, size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ICONS = {
  calendar:  "M8 2v3m8-3v3M3 8h18M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z",
  building:  "M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21V11h6v10",
  ticket:    "M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1 0 4v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 0-4V9z",
  bell:      "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9m4.7 13a2 2 0 0 0 2.6 0",
  check:     "M20 6L9 17l-5-5",
  clock:     "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v6l4 2",
  arrow:     "M5 12h14m-7-7 7 7-7 7",
  plus:      "M12 5v14m-7-7h14",
  user:      "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
  refresh:   "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8m0 0V3m0 5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16m0 0v5m0-5h5",
  wrench:    "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  sparkles:  "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z",
  qr:        "M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zm10 0h2v2h-2zm4 0h2v4h-4v-2h2zm-4 4h2v2h-2z",
  logout:    "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9",
  xmark:     "M18 6 6 18M6 6l12 12",
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  APPROVED:  { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  PENDING:   { bg: "bg-amber-50 dark:bg-amber-900/20",     text: "text-amber-700 dark:text-amber-400",     dot: "bg-amber-400"  },
  REJECTED:  { bg: "bg-rose-50 dark:bg-rose-900/20",       text: "text-rose-700 dark:text-rose-400",       dot: "bg-rose-500"   },
  CANCELLED: { bg: "bg-gray-100 dark:bg-gray-800",         text: "text-gray-500 dark:text-gray-400",       dot: "bg-gray-400"   },
  OPEN:      { bg: "bg-blue-50 dark:bg-blue-900/20",       text: "text-blue-700 dark:text-blue-400",       dot: "bg-blue-500"   },
  RESOLVED:  { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  HIGH:      { bg: "bg-rose-50 dark:bg-rose-900/20",       text: "text-rose-700 dark:text-rose-400",       dot: "bg-rose-500"   },
  MEDIUM:    { bg: "bg-amber-50 dark:bg-amber-900/20",     text: "text-amber-700 dark:text-amber-400",     dot: "bg-amber-400"  },
  LOW:       { bg: "bg-teal-50 dark:bg-teal-900/20",       text: "text-teal-700 dark:text-teal-400",       dot: "bg-teal-500"   },
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
const fmtTime = (t) => t ? t.slice(0, 5) : "—";

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ── Greeting ──────────────────────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent, loading }) {
  const accents = {
    amber:  "from-amber-400/20 to-amber-500/5 border-amber-200/60 dark:border-amber-700/30",
    teal:   "from-teal-400/20 to-teal-500/5 border-teal-200/60 dark:border-teal-700/30",
    indigo: "from-indigo-400/20 to-indigo-500/5 border-indigo-200/60 dark:border-indigo-700/30",
    rose:   "from-rose-400/20 to-rose-500/5 border-rose-200/60 dark:border-rose-700/30",
  };
  const iconColors = {
    amber: "text-amber-500", teal: "text-teal-500", indigo: "text-indigo-500", rose: "text-rose-500",
  };
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${accents[accent]} bg-white dark:bg-gray-900`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-sm ${iconColors[accent]}`}>
          <Icon d={ICONS[icon]} size={18} />
        </div>
      </div>
      {loading
        ? <div className="h-8 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse mb-1" />
        : <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>}
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">{label}</p>
      {sub && !loading && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

// ── Quick Action Button ───────────────────────────────────────────────────────
function QuickAction({ icon, label, desc, onClick, color }) {
  const colors = {
    amber:  "hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:border-amber-200 dark:hover:border-amber-700/50 group-hover:text-amber-500",
    teal:   "hover:bg-teal-50 dark:hover:bg-teal-900/10 hover:border-teal-200 dark:hover:border-teal-700/50 group-hover:text-teal-500",
    indigo: "hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-700/50 group-hover:text-indigo-500",
    rose:   "hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:border-rose-200 dark:hover:border-rose-700/50 group-hover:text-rose-500",
  };
  return (
    <button onClick={onClick}
      className={`group w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800
        bg-white dark:bg-gray-900 transition-all duration-200 text-left ${colors[color]}`}>
      <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors ${colors[color]}`}>
        <Icon d={ICONS[icon]} size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{desc}</p>
      </div>
      <Icon d={ICONS.arrow} size={14} color="currentColor" />
    </button>
  );
}

// ── Timeline item ──────────────────────────────────────────────────────────────
function TimelineItem({ booking, isLast }) {
  const today = new Date().toISOString().split("T")[0];
  const isToday = booking.booking_date === today || booking.bookingDate === today;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
          ${isToday ? "bg-amber-100 dark:bg-amber-900/30" : "bg-gray-100 dark:bg-gray-800"}`}>
          <Icon d={ICONS.calendar} size={14} color={isToday ? "#f59e0b" : "currentColor"} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-100 dark:bg-gray-800 my-1" />}
      </div>
      <div className={`pb-4 min-w-0 flex-1 ${isLast ? "" : ""}`}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
            {booking.resourceName || booking.resource_name || "Resource"}
          </p>
          <StatusBadge status={booking.status} />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {fmtDate(booking.booking_date || booking.bookingDate)}
          {" · "}
          {fmtTime(booking.start_time || booking.startTime)} – {fmtTime(booking.end_time || booking.endTime)}
        </p>
        {booking.purpose && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{booking.purpose}</p>
        )}
        {isToday && booking.status === "APPROVED" && (
          <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Today
          </span>
        )}
      </div>
    </div>
  );
}

// ── Notification Item ─────────────────────────────────────────────────────────
function NotifItem({ notif }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl transition-colors
      ${!notif.is_read ? "bg-amber-50/50 dark:bg-amber-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}>
      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!notif.is_read ? "bg-amber-400" : "bg-transparent"}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{notif.message}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{fmtDate(notif.created_at)}</p>
      </div>
    </div>
  );
}

// ── Ticket Row ────────────────────────────────────────────────────────────────
function TicketRow({ ticket }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className={`p-1.5 rounded-lg ${
        ticket.priority === "HIGH"   ? "bg-rose-50 dark:bg-rose-900/20 text-rose-500" :
        ticket.priority === "MEDIUM" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-500" :
                                       "bg-teal-50 dark:bg-teal-900/20 text-teal-500"}`}>
        <Icon d={ICONS.wrench} size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{ticket.category}</p>
        <p className="text-xs text-gray-400 truncate">{ticket.description?.slice(0, 60)}…</p>
      </div>
      <StatusBadge status={ticket.status} />
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function Empty({ icon, msg }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-300 dark:text-gray-700">
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
        <Icon d={ICONS[icon]} size={24} />
      </div>
      <p className="text-sm text-gray-400 dark:text-gray-500">{msg}</p>
    </div>
  );
}

// ── Card wrapper ──────────────────────────────────────────────────────────────
function Card({ title, icon, action, onAction, children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 dark:text-gray-600">
            <Icon d={ICONS[icon]} size={15} />
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{title}</h2>
        </div>
        {action && (
          <button onClick={onAction}
            className="text-xs font-semibold text-amber-500 hover:text-amber-600 dark:text-amber-400 flex items-center gap-1 transition-colors">
            {action} <Icon d={ICONS.arrow} size={12} />
          </button>
        )}
      </div>
      <div className="px-5 pb-5">{children}</div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function UserDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading,       setLoading]       = useState(true);
  const [bookings,      setBookings]      = useState([]);
  const [tickets,       setTickets]       = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [resources,     setResources]     = useState([]);
  const [error,         setError]         = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bRes, tRes, nRes, rRes] = await Promise.allSettled([
        axios.get("/api/bookings/my"),
        axios.get("/api/tickets/my"),
        axios.get("/api/notifications"),
        axios.get("/api/resources?size=20&status=ACTIVE"),
      ]);

      const norm = (res) => {
        if (res.status !== "fulfilled") return [];
        const d = res.value.data;
        return Array.isArray(d) ? d : (d?.content ?? d?.data ?? []);
      };

      setBookings(norm(bRes));
      setTickets(norm(tRes));
      setNotifications(norm(nRes));
      setResources(norm(rRes));
    } catch (e) {
      setError("Could not load your dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const upcoming = bookings
    .filter(b => {
      const d = b.booking_date || b.bookingDate || "";
      return d >= new Date().toISOString().split("T")[0] && b.status === "APPROVED";
    })
    .sort((a, b) => (a.booking_date || a.bookingDate) > (b.booking_date || b.bookingDate) ? 1 : -1)
    .slice(0, 5);

  const recentBookings = [...bookings]
    .sort((a, b) => (b.created_at || "") > (a.created_at || "") ? 1 : -1)
    .slice(0, 6);

  const openTickets  = tickets.filter(t => !["RESOLVED", "CLOSED", "REJECTED"].includes(t.status));
  const unreadNotifs = notifications.filter(n => !n.is_read);

  const firstName = (user?.name || "there").split(" ")[0];

  // ── Next booking countdown ─────────────────────────────────────────────────
  const nextBooking = upcoming[0];
  const daysUntil = nextBooking
    ? Math.ceil((new Date(nextBooking.booking_date || nextBooking.bookingDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
          dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-7 md:p-10">

          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="absolute -bottom-8 left-1/3 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl" />
            <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-indigo-500/8 blur-2xl" />
          </div>

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-4">
                {user?.picture_url
                  ? <img src={user.picture_url} alt={user.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/10" />
                  : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600
                      flex items-center justify-center text-white font-bold text-lg">
                      {firstName[0]?.toUpperCase()}
                    </div>
                  )}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{greeting()}</p>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{firstName}</h1>
                </div>
              </div>

              {/* Next booking pill */}
              {nextBooking && (
                <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-sm text-gray-300">
                    Next booking{" "}
                    <span className="font-semibold text-white">
                      {daysUntil === 0 ? "today" : daysUntil === 1 ? "tomorrow" : `in ${daysUntil} days`}
                    </span>
                    {" · "}
                    {fmtDate(nextBooking.booking_date || nextBooking.bookingDate)}
                    {" "}
                    {fmtTime(nextBooking.start_time || nextBooking.startTime)}
                  </span>
                </div>
              )}
            </div>

            {/* Right side refresh */}
            <button onClick={fetchAll} disabled={loading}
              className="self-start md:self-center flex items-center gap-2 px-4 py-2 rounded-xl
                bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm
                transition-all disabled:opacity-50">
              <span className={loading ? "animate-spin" : ""}><Icon d={ICONS.refresh} size={14} /></span>
              Refresh
            </button>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-900/20
            border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm">
            <Icon d={ICONS.xmark} size={15} />
            {error}
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="calendar" label="My Bookings"    value={loading ? "—" : bookings.length}        sub={`${upcoming.length} upcoming`}     accent="amber"  loading={loading} />
          <StatCard icon="check"    label="Approved"       value={loading ? "—" : bookings.filter(b => b.status === "APPROVED").length} sub="confirmed"  accent="teal"   loading={loading} />
          <StatCard icon="wrench"   label="Open Tickets"   value={loading ? "—" : openTickets.length}     sub={`${tickets.length} total`}         accent="indigo" loading={loading} />
          <StatCard icon="bell"     label="Notifications"  value={loading ? "—" : unreadNotifs.length}    sub="unread"                             accent="rose"   loading={loading} />
        </div>

        {/* ── Quick Actions ── */}
        <Card title="Quick Actions" icon="sparkles">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <QuickAction icon="plus"     label="New Booking"     desc="Book a resource"         onClick={() => navigate("/user/bookings/new")}       color="amber" />
            <QuickAction icon="calendar" label="My Bookings"     desc="View all bookings"       onClick={() => navigate("/user/bookings")}            color="teal"  />
            <QuickAction icon="wrench"   label="Report Issue"    desc="Submit a ticket"         onClick={() => navigate("/user/maintenance/report")}  color="indigo"/>
            <QuickAction icon="building" label="Browse Resources" desc="Explore facilities"     onClick={() => navigate("/user/resources")}           color="rose"  />
          </div>
        </Card>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Upcoming Bookings Timeline (2/3 width) ── */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Upcoming Bookings" icon="calendar"
              action="All bookings" onAction={() => navigate("/user/bookings")}>
              {loading
                ? <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                  </div>
                : upcoming.length === 0
                  ? <Empty icon="calendar" msg="No upcoming bookings" />
                  : (
                    <div className="mt-2">
                      {upcoming.map((b, i) => (
                        <TimelineItem key={b.id} booking={b} isLast={i === upcoming.length - 1} />
                      ))}
                    </div>
                  )}
            </Card>

            {/* ── Recent Activity ── */}
            <Card title="Recent Activity" icon="clock"
              action="View all" onAction={() => navigate("/user/bookings")}>
              {loading
                ? <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                  </div>
                : recentBookings.length === 0
                  ? <Empty icon="calendar" msg="No bookings yet" />
                  : (
                    <div className="space-y-1">
                      {recentBookings.map((b) => (
                        <div key={b.id}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 shrink-0">
                            <Icon d={ICONS.building} size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                              {b.resourceName || b.resource_name || "Resource"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {fmtDate(b.booking_date || b.bookingDate)} · {fmtTime(b.start_time || b.startTime)}
                            </p>
                          </div>
                          <StatusBadge status={b.status} />
                        </div>
                      ))}
                    </div>
                  )}
            </Card>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-6">

            {/* ── Notifications ── */}
            <Card title="Notifications" icon="bell"
              action="See all" onAction={() => navigate("/user/notifications")}>
              {loading
                ? <div className="space-y-2">
                    {[1, 2].map(i => <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
                  </div>
                : notifications.length === 0
                  ? <Empty icon="bell" msg="No notifications" />
                  : (
                    <div className="space-y-1">
                      {notifications.slice(0, 5).map((n) => (
                        <NotifItem key={n.id} notif={n} />
                      ))}
                    </div>
                  )}
            </Card>

            {/* ── My Tickets ── */}
            <Card title="My Tickets" icon="ticket"
              action="View all" onAction={() => navigate("/user/maintenance")}>
              {loading
                ? <div className="space-y-2">
                    {[1, 2].map(i => <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
                  </div>
                : tickets.length === 0
                  ? (
                    <div className="space-y-3">
                      <Empty icon="ticket" msg="No tickets raised" />
                      <button onClick={() => navigate("/user/maintenance/report")}
                        className="w-full py-2.5 rounded-xl border border-dashed border-gray-200 dark:border-gray-700
                          text-sm text-gray-400 dark:text-gray-500 hover:border-amber-300 hover:text-amber-500 transition-colors">
                        + Report an issue
                      </button>
                    </div>
                  )
                  : (
                    <div className="space-y-1">
                      {tickets.slice(0, 4).map((t) => (
                        <TicketRow key={t.id} ticket={t} />
                      ))}
                    </div>
                  )}
            </Card>

            {/* ── Available Resources pill strip ── */}
            <Card title="Available Now" icon="building">
              {loading
                ? <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-7 w-24 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
                  </div>
                : resources.length === 0
                  ? <Empty icon="building" msg="No resources found" />
                  : (
                    <div className="flex flex-wrap gap-2">
                      {resources.slice(0, 8).map((r) => (
                        <button key={r.id}
                          onClick={() => navigate("/user/bookings/new")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                            bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400
                            hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400
                            border border-transparent hover:border-amber-200 dark:hover:border-amber-700/50
                            transition-all">
                          {r.name?.split(" ").slice(0, 2).join(" ")}
                        </button>
                      ))}
                      <button onClick={() => navigate("/user/resources")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium
                          text-amber-500 hover:text-amber-600 transition-colors">
                        More <Icon d={ICONS.arrow} size={11} />
                      </button>
                    </div>
                  )}
            </Card>
          </div>
        </div>

        {/* ── Footer nudge ── */}
        <div className="flex items-center justify-center gap-6 pt-2 pb-4">
          <button onClick={() => navigate("/user/account/profile")}
            className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600
              hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
            <Icon d={ICONS.user} size={13} /> Profile
          </button>
          <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
          <button onClick={() => navigate("/user/notifications")}
            className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600
              hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
            <Icon d={ICONS.bell} size={13} /> Notifications
          </button>
          <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
          <button onClick={() => navigate("/user/logout")}
            className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600
              hover:text-rose-500 transition-colors">
            <Icon d={ICONS.logout} size={13} /> Sign out
          </button>
        </div>

      </div>
    </div>
  );
}