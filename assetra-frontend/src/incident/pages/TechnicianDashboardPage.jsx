import { useEffect, useState } from "react";
import { useAuth } from "../../shared/context/AuthContext";
import { getAllTickets } from "../api/ticketApi";
import { useNavigate } from "react-router-dom";

const PRIORITY_RANK = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const PRIORITY_STYLE = {
  CRITICAL: { bar: "bg-red-500",    text: "text-red-400",     badge: "bg-red-500/15 border-red-500/30 text-red-400" },
  HIGH:     { bar: "bg-orange-500", text: "text-orange-400",  badge: "bg-orange-500/15 border-orange-500/30 text-orange-400" },
  MEDIUM:   { bar: "bg-amber-400",  text: "text-amber-400",   badge: "bg-amber-500/15 border-amber-500/30 text-amber-400" },
  LOW:      { bar: "bg-emerald-500",text: "text-emerald-400", badge: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" },
};

const STATUS_STYLE = {
  OPEN:        { dot: "bg-blue-400",    text: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
  IN_PROGRESS: { dot: "bg-amber-400",   text: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  RESOLVED:    { dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  CLOSED:      { dot: "bg-gray-400",    text: "text-gray-400",    bg: "bg-gray-500/10 border-gray-500/20" },
};

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function TechnicianDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    getAllTickets()
      .then((res) => {
        const mine = res.data.filter((t) => t.assignedTo === user.id);
        setTickets(mine);
      })
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const assigned    = tickets.filter(t => t.status === "IN_PROGRESS");
  const resolved    = tickets.filter(t => t.status === "RESOLVED" || t.status === "CLOSED");
  const open        = tickets.filter(t => t.status === "OPEN");
  const critical    = tickets.filter(t => t.priority === "CRITICAL" && t.status !== "RESOLVED" && t.status !== "CLOSED");

  const urgent = [...assigned, ...open]
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
    .slice(0, 4);

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const completionRate = tickets.length > 0
    ? Math.round((resolved.length / tickets.length) * 100)
    : 0;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-teal-500/20 border-t-teal-400 animate-spin" style={{ animationDirection: "reverse" }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-6 max-w-6xl mx-auto">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0)} 50%{box-shadow:0 0 20px 4px rgba(16,185,129,0.15)} }
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes scan     { 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }
        @keyframes ticker   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        .syne { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'DM Mono', monospace; }

        .fu-1 { animation: fadeUp 0.5s ease 0.05s both; }
        .fu-2 { animation: fadeUp 0.5s ease 0.1s  both; }
        .fu-3 { animation: fadeUp 0.5s ease 0.15s both; }
        .fu-4 { animation: fadeUp 0.5s ease 0.2s  both; }
        .fu-5 { animation: fadeUp 0.5s ease 0.25s both; }
        .fu-6 { animation: fadeUp 0.5s ease 0.3s  both; }

        .stat-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          border-color: rgba(16,185,129,0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(16,185,129,0.08);
        }

        .hero-card {
          background: linear-gradient(135deg, #0a1a14 0%, #0d1f18 50%, #091510 100%);
          border: 1px solid rgba(16,185,129,0.15);
          position: relative;
          overflow: hidden;
        }
        .hero-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.08) 0%, transparent 60%);
          pointer-events: none;
        }

        .scan-line {
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent);
          animation: scan 3s linear infinite;
        }

        .ring-progress {
          transition: stroke-dashoffset 1s ease;
        }

        .ticket-item {
          transition: all 0.2s ease;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
        }
        .ticket-item:hover {
          border-color: rgba(16,185,129,0.2);
          background: rgba(16,185,129,0.03);
          transform: translateX(4px);
        }

        .critical-pulse { animation: pulse-glow 2s ease infinite; }

        .ticker-wrap {
          overflow: hidden;
          mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent);
        }
        .ticker-inner {
          display: flex;
          gap: 2rem;
          white-space: nowrap;
          animation: ticker 20s linear infinite;
        }
      `}</style>

      {/* ── Hero greeting strip ── */}
      <div className="hero-card rounded-2xl p-6 mb-6 fu-1">
        <div className="scan-line" />
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div>
            <p className="mono text-emerald-400/60 text-xs tracking-widest uppercase mb-1">
              {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="syne text-2xl font-bold text-white mb-0.5">
              {greeting()}, <span className="text-emerald-400">{user?.name?.split(" ")[0] || "Tech"}</span> 👋
            </h1>
            <p className="text-gray-500 text-sm">
              You have <span className="text-amber-400 font-semibold">{assigned.length}</span> active tickets
              {critical.length > 0 && <> and <span className="text-red-400 font-semibold">{critical.length} critical</span> to handle</>}
            </p>
          </div>

          {/* Live clock */}
          <div className="mono text-right">
            <p className="text-3xl font-medium text-white tracking-tight">
              {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
            </p>
            <p className="text-xs text-emerald-500/60 tracking-widest">
              {time.toLocaleTimeString("en-US", { second: "2-digit" }).split(":")[2]} SEC
            </p>
          </div>
        </div>

        {/* Ticker if critical */}
        {critical.length > 0 && (
          <div className="mt-4 ticker-wrap relative z-10">
            <div className="ticker-inner">
              {[...critical, ...critical].map((t, i) => (
                <span key={i} className="mono text-xs text-red-400/80 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
                  CRITICAL: {t.category} — {t.description?.slice(0, 40)}...
                  <span className="text-red-400/30 mx-2">///</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 fu-2">

        {/* Total assigned */}
        <div className="stat-card rounded-2xl p-4 cursor-pointer" onClick={() => navigate("/technician/tickets/assigned")}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="mono text-xs text-emerald-400/50">TOTAL</span>
          </div>
          <p className="syne text-3xl font-bold text-white">{tickets.length}</p>
          <p className="text-xs text-gray-500 mt-1">All assigned tickets</p>
        </div>

        {/* In progress */}
        <div className="stat-card rounded-2xl p-4 cursor-pointer" onClick={() => navigate("/technician/tickets/assigned")}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="mono text-xs text-amber-400/50">ACTIVE</span>
          </div>
          <p className="syne text-3xl font-bold text-amber-400">{assigned.length}</p>
          <p className="text-xs text-gray-500 mt-1">In progress</p>
        </div>

        {/* Resolved */}
        <div className="stat-card rounded-2xl p-4 cursor-pointer" onClick={() => navigate("/technician/tickets/resolved")}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="mono text-xs text-emerald-400/50">DONE</span>
          </div>
          <p className="syne text-3xl font-bold text-emerald-400">{resolved.length}</p>
          <p className="text-xs text-gray-500 mt-1">Resolved</p>
        </div>

        {/* Critical */}
        <div className={`stat-card rounded-2xl p-4 ${critical.length > 0 ? "critical-pulse" : ""}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <span className="mono text-xs text-red-400/50">URGENT</span>
          </div>
          <p className="syne text-3xl font-bold text-red-400">{critical.length}</p>
          <p className="text-xs text-gray-500 mt-1">Critical priority</p>
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left: Urgent tickets list (2/3 width) */}
        <div className="lg:col-span-2 fu-3">
          <div className="stat-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="syne font-bold text-white text-base">Priority Queue</h2>
                <p className="text-xs text-gray-500">Your most urgent tickets</p>
              </div>
              <button onClick={() => navigate("/technician/tickets/assigned")}
                className="mono text-xs text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40">
                View all →
              </button>
            </div>

            {urgent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-400 font-medium text-sm">All clear!</p>
                <p className="text-gray-600 text-xs mt-1">No urgent tickets right now</p>
              </div>
            ) : (
              <div className="space-y-2">
                {urgent.map((ticket, i) => {
                  const ps = PRIORITY_STYLE[ticket.priority] || PRIORITY_STYLE.MEDIUM;
                  const ss = STATUS_STYLE[ticket.status] || STATUS_STYLE.OPEN;
                  return (
                    <div key={ticket.id}
                      className="ticket-item rounded-xl p-4 cursor-pointer"
                      onClick={() => navigate("/technician/tickets/assigned")}
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Priority bar */}
                        <div className={`w-1 h-10 rounded-full ${ps.bar} shrink-0`} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="syne text-sm font-semibold text-white truncate">{ticket.category}</span>
                            <span className={`mono text-xs px-2 py-0.5 rounded-md border ${ps.badge}`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{ticket.description}</p>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${ss.bg} ${ss.text}`}>
                            <span className={`w-1 h-1 rounded-full ${ss.dot}`} />
                            {ticket.status.replace("_", " ")}
                          </span>
                          <span className="mono text-xs text-gray-600">{timeAgo(ticket.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Completion ring + quick actions (1/3 width) */}
        <div className="space-y-4 fu-4">

          {/* Completion rate ring */}
          <div className="stat-card rounded-2xl p-5 flex flex-col items-center">
            <h2 className="syne font-bold text-white text-sm mb-4 self-start">Completion Rate</h2>
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke="url(#emerald-grad)" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - completionRate / 100)}`}
                  className="ring-progress"
                />
                <defs>
                  <linearGradient id="emerald-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="syne text-2xl font-bold text-white">{completionRate}%</span>
                <span className="mono text-xs text-gray-500">resolved</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full mt-4">
              <div className="text-center p-2 rounded-lg bg-emerald-500/8 border border-emerald-500/15">
                <p className="syne text-lg font-bold text-emerald-400">{resolved.length}</p>
                <p className="mono text-xs text-gray-500">Done</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-amber-500/8 border border-amber-500/15">
                <p className="syne text-lg font-bold text-amber-400">{assigned.length}</p>
                <p className="mono text-xs text-gray-500">Active</p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="stat-card rounded-2xl p-5">
            <h2 className="syne font-bold text-white text-sm mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: "My Assigned Tickets", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", path: "/technician/tickets/assigned", color: "emerald" },
                { label: "Open Tickets",        icon: "M4 6h16M4 10h16M4 14h16M4 18h16",                                                                                                    path: "/technician/tickets/open",     color: "blue"    },
                { label: "Resolved Tickets",    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",                                                                                     path: "/technician/tickets/resolved", color: "teal"    },
              ].map((action) => (
                <button key={action.path}
                  onClick={() => navigate(action.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                    border border-white/6 bg-white/2 hover:border-${action.color}-500/30
                    hover:bg-${action.color}-500/5 transition-all duration-200 text-left group`}
                >
                  <div className={`w-7 h-7 rounded-lg bg-${action.color}-500/15 flex items-center justify-center shrink-0`}>
                    <svg className={`w-3.5 h-3.5 text-${action.color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
                  <svg className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 ml-auto transition-all group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Priority breakdown bar ── */}
      {tickets.length > 0 && (
        <div className="stat-card rounded-2xl p-5 mt-4 fu-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="syne font-bold text-white text-sm">Priority Breakdown</h2>
            <span className="mono text-xs text-gray-500">{tickets.length} total tickets</span>
          </div>
          <div className="flex rounded-full overflow-hidden h-3 mb-4 bg-white/5">
            {["CRITICAL","HIGH","MEDIUM","LOW"].map((p) => {
              const count = tickets.filter(t => t.priority === p).length;
              const pct = tickets.length > 0 ? (count / tickets.length) * 100 : 0;
              if (pct === 0) return null;
              return <div key={p} className={`${PRIORITY_STYLE[p].bar} h-full transition-all duration-1000`} style={{ width: `${pct}%` }} />;
            })}
          </div>
          <div className="flex gap-4 flex-wrap">
            {["CRITICAL","HIGH","MEDIUM","LOW"].map((p) => {
              const count = tickets.filter(t => t.priority === p).length;
              if (count === 0) return null;
              return (
                <div key={p} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${PRIORITY_STYLE[p].bar}`} />
                  <span className={`mono text-xs ${PRIORITY_STYLE[p].text}`}>{p}</span>
                  <span className="mono text-xs text-gray-600">({count})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
