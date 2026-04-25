import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTickets, updateTicketStatus } from "../api/ticketApi";

const STATUS_CONFIG = {
  OPEN:        { color: "bg-blue-500/15 text-blue-400 border-blue-500/25",         dot: "bg-blue-400" },
  IN_PROGRESS: { color: "bg-amber-500/15 text-amber-400 border-amber-500/25",      dot: "bg-amber-400" },
  RESOLVED:    { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",dot: "bg-emerald-400" },
  CLOSED:      { color: "bg-gray-500/15 text-gray-400 border-gray-500/25",         dot: "bg-gray-400" },
  REJECTED:    { color: "bg-red-500/15 text-red-400 border-red-500/25",            dot: "bg-red-400" },
};

const PRIORITY_COLORS = {
  LOW: "text-emerald-400", MEDIUM: "text-amber-400", HIGH: "text-orange-400", CRITICAL: "text-red-400"
};

export default function AdminAllTicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    getAllTickets()
      .then((res) => setTickets(res.data))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? tickets : tickets.filter((t) => t.status === filter);

  const handleStatusChange = async (ticketId, status) => {
    setUpdating(ticketId);
    try {
      await updateTicketStatus(ticketId, { status });
      setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status } : t));
    } catch { alert("Failed to update status"); }
    finally { setUpdating(null); }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "OPEN").length,
    inProgress: tickets.filter(t => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter(t => t.status === "RESOLVED").length,
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .stat-card { animation: fadeUp 0.4s ease both; }
        .stat-card:nth-child(1){animation-delay:0.05s}
        .stat-card:nth-child(2){animation-delay:0.1s}
        .stat-card:nth-child(3){animation-delay:0.15s}
        .stat-card:nth-child(4){animation-delay:0.2s}
        .ticket-row { animation: fadeUp 0.3s ease both; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">All Tickets</h1>
          <p className="text-sm text-gray-400">{tickets.length} total incident reports</p>
        </div>
        <button onClick={() => navigate("/admin/maintenance/assign")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600
                     text-white text-sm font-semibold transition-all hover:scale-105 shadow-lg shadow-orange-500/25">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Assign Technician
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total", value: stats.total, color: "text-white", bg: "bg-white/4 border-white/8" },
          { label: "Open", value: stats.open, color: "text-blue-400", bg: "bg-blue-500/8 border-blue-500/15" },
          { label: "In Progress", value: stats.inProgress, color: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/15" },
          { label: "Resolved", value: stats.resolved, color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/15" },
        ].map((s) => (
          <div key={s.label} className={`stat-card p-4 rounded-2xl border ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6 p-1 bg-white/4 rounded-xl w-fit">
        {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${filter === s ? "bg-orange-500 text-white shadow-md" : "text-gray-400 hover:text-white"}`}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">No tickets found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket, i) => {
            const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
            return (
              <div key={ticket.id}
                className="ticket-row p-5 rounded-2xl border border-white/8 bg-white/4
                           hover:border-orange-500/20 hover:bg-orange-500/3 transition-all duration-200"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-semibold text-white">{ticket.category}</span>
                      <span className={`text-xs font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                        • {ticket.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{ticket.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      {ticket.contactDetails && <span>📞 {ticket.contactDetails}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {ticket.status.replace("_", " ")}
                    </span>
                    <select value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      disabled={updating === ticket.id}
                      className="text-xs px-2 py-1.5 rounded-lg border border-white/10 bg-white/6
                                 text-gray-300 cursor-pointer focus:outline-none focus:border-orange-500/50
                                 disabled:opacity-50"
                    >
                      {["OPEN","IN_PROGRESS","RESOLVED","CLOSED","REJECTED"].map(s => (
                        <option key={s} value={s}>{s.replace("_"," ")}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}