import { useEffect, useState } from "react";
import { getAllTickets } from "../api/ticketApi";

const PRIORITY_CONFIG = {
  LOW:      { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  MEDIUM:   { color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  HIGH:     { color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20" },
  CRITICAL: { color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
};

export default function TechnicianOpenTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllTickets()
      .then((res) => setTickets(res.data.filter((t) => t.status === "OPEN" && !t.assignedTo)))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter((t) =>
    t.category.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .ticket-card { animation: fadeUp 0.3s ease both; }
      `}</style>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">All Open Tickets</h1>
            <p className="text-sm text-gray-400">{filtered.length} unassigned tickets</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by category or description..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/8 bg-white/4
                     text-white text-sm placeholder-gray-600
                     focus:outline-none focus:border-orange-500/40 focus:bg-orange-500/5 transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium mb-1">All clear!</p>
          <p className="text-gray-600 text-sm">No open unassigned tickets.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket, i) => {
            const pc = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.MEDIUM;
            return (
              <div key={ticket.id}
                className="ticket-card p-5 rounded-2xl border border-white/8 bg-white/4
                           hover:border-blue-500/20 hover:bg-blue-500/3 transition-all duration-200"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-white">{ticket.category}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${pc.bg} ${pc.color}`}>
                        {ticket.priority}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold">
                        OPEN
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{ticket.description}</p>
                    <p className="text-xs text-gray-600">
                      Reported {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
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