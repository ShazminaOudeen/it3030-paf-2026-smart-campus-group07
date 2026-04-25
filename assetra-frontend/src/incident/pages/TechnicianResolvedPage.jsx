import { useEffect, useState } from "react";
import { getAllTickets } from "../api/ticketApi";

export default function TechnicianResolvedPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const technicianId = "00000000-0000-0000-0000-000000000002";

  useEffect(() => {
    getAllTickets()
      .then((res) => setTickets(res.data.filter(
        (t) => (t.status === "RESOLVED" || t.status === "CLOSED") && t.assignedTo === technicianId
      )))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

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
        .ticket-card:nth-child(1){animation-delay:0.05s}
        .ticket-card:nth-child(2){animation-delay:0.1s}
        .ticket-card:nth-child(3){animation-delay:0.15s}
      `}</style>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Resolved Tickets</h1>
          <p className="text-sm text-gray-400">{tickets.length} completed ticket(s)</p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium mb-1">Nothing resolved yet</p>
          <p className="text-gray-600 text-sm">Your completed tickets will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id}
              className="ticket-card p-5 rounded-2xl border border-white/8 bg-white/4
                         hover:border-emerald-500/20 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-white">{ticket.category}</span>
                    <span className="text-xs text-orange-400">{ticket.priority}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{ticket.description}</p>
                  {ticket.resolutionNotes && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
                      <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-xs text-emerald-400">{ticket.resolutionNotes}</p>
                    </div>
                  )}
                </div>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap
                  ${ticket.status === "RESOLVED"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                    : "bg-gray-500/15 text-gray-400 border-gray-500/25"
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${ticket.status === "RESOLVED" ? "bg-emerald-400" : "bg-gray-400"}`} />
                  {ticket.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}