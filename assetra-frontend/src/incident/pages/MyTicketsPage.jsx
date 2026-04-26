import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTickets } from "../api/ticketApi";

const STATUS_CONFIG = {
  OPEN:        { color: "bg-blue-500/15 text-blue-400 border-blue-500/25",      dot: "bg-blue-400",    label: "Open" },
  IN_PROGRESS: { color: "bg-amber-500/15 text-amber-400 border-amber-500/25",   dot: "bg-amber-400",   label: "In Progress" },
  RESOLVED:    { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", dot: "bg-emerald-400", label: "Resolved" },
  CLOSED:      { color: "bg-gray-500/15 text-gray-400 border-gray-500/25",      dot: "bg-gray-400",    label: "Closed" },
  REJECTED:    { color: "bg-red-500/15 text-red-400 border-red-500/25",         dot: "bg-red-400",     label: "Rejected" },
};

const PRIORITY_CONFIG = {
  LOW:      { color: "text-emerald-400", bg: "bg-emerald-500/10" },
  MEDIUM:   { color: "text-amber-400",   bg: "bg-amber-500/10" },
  HIGH:     { color: "text-orange-400",  bg: "bg-orange-500/10" },
  CRITICAL: { color: "text-red-400",     bg: "bg-red-500/10" },
};

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const userId = "00000000-0000-0000-0000-000000000001";

  useEffect(() => {
    getMyTickets(userId)
      .then((res) => setTickets(res.data))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? tickets : tickets.filter((t) => t.status === filter);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading tickets...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .ticket-card { animation: fadeSlideUp 0.4s ease both; }
        .ticket-card:nth-child(1){animation-delay:0.05s}
        .ticket-card:nth-child(2){animation-delay:0.1s}
        .ticket-card:nth-child(3){animation-delay:0.15s}
        .ticket-card:nth-child(4){animation-delay:0.2s}
        .ticket-card:nth-child(5){animation-delay:0.25s}
      `}</style>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">My Tickets</h1>
          <p className="text-gray-400 text-sm">{tickets.length} total • {tickets.filter(t=>t.status==="OPEN").length} open</p>
        </div>
        <button
          onClick={() => navigate("/user/maintenance/report")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600
                     text-white text-sm font-semibold transition-all hover:scale-105 shadow-lg shadow-orange-500/25"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Report Issue
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6 p-1 bg-white/4 rounded-xl w-fit">
        {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
              ${filter === s ? "bg-orange-500 text-white shadow-md" : "text-gray-400 hover:text-white"}`}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">No tickets found</p>
          <button onClick={() => navigate("/user/maintenance/report")}
            className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-all">
            Report your first issue
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
            const priority = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.MEDIUM;
            return (
              <div key={ticket.id}
                onClick={() => navigate(`/user/maintenance/${ticket.id}`)}
                className="ticket-card group p-5 rounded-2xl border border-white/8 bg-white/4
                           cursor-pointer hover:border-orange-500/30 hover:bg-orange-500/5
                           hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-white">{ticket.category}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priority.bg} ${priority.color}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate mb-3">{ticket.description}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-orange-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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