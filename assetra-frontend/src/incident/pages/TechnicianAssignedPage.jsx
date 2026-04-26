import { useEffect, useState } from "react";
import { getAllTickets, updateTicketStatus } from "../api/ticketApi";

const STATUS_CONFIG = {
  IN_PROGRESS: { color: "bg-amber-500/15 text-amber-400 border-amber-500/25", dot: "bg-amber-400" },
  RESOLVED:    { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", dot: "bg-emerald-400" },
  CLOSED:      { color: "bg-gray-500/15 text-gray-400 border-gray-500/25", dot: "bg-gray-400" },
  OPEN:        { color: "bg-blue-500/15 text-blue-400 border-blue-500/25", dot: "bg-blue-400" },
};

export default function TechnicianAssignedPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const [updating, setUpdating] = useState(null);
  const technicianId = "00000000-0000-0000-0000-000000000002";

  useEffect(() => {
    getAllTickets()
      .then((res) => setTickets(res.data.filter((t) => t.assignedTo === technicianId)))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (ticketId, status) => {
    setUpdating(ticketId + status);
    try {
      await updateTicketStatus(ticketId, { status, resolutionNotes: notes[ticketId] || "" });
      setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status } : t));
    } catch { alert("Failed to update status"); }
    finally { setUpdating(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .ticket-card { animation: fadeUp 0.4s ease both; }
        .ticket-card:nth-child(1){animation-delay:0.05s}
        .ticket-card:nth-child(2){animation-delay:0.1s}
        .ticket-card:nth-child(3){animation-delay:0.15s}
      `}</style>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Assigned to Me</h1>
          <p className="text-sm text-gray-400">{tickets.length} ticket(s) assigned to you</p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-500">No tickets assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
            return (
              <div key={ticket.id} className="ticket-card p-5 rounded-2xl border border-white/8 bg-white/4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{ticket.category}</span>
                      <span className="text-xs text-orange-400 font-medium">{ticket.priority}</span>
                    </div>
                    <p className="text-sm text-gray-400">{ticket.description}</p>
                    {ticket.contactDetails && (
                      <p className="text-xs text-gray-600 mt-1">📞 {ticket.contactDetails}</p>
                    )}
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${status.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>

                {/* Notes */}
                <textarea
                  placeholder="Add resolution notes here..."
                  value={notes[ticket.id] || ""}
                  onChange={(e) => setNotes({ ...notes, [ticket.id]: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-white/8 bg-white/4
                             text-sm text-gray-300 placeholder-gray-600 resize-none mb-3
                             focus:outline-none focus:border-orange-500/40 focus:bg-orange-500/5 transition-all"
                />

                {/* Action buttons */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { status: "IN_PROGRESS", label: "In Progress", color: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" },
                    { status: "RESOLVED", label: "Mark Resolved", color: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" },
                    { status: "CLOSED", label: "Close Ticket", color: "bg-gray-600 hover:bg-gray-700 shadow-gray-500/20" },
                  ].map((btn) => (
                    <button key={btn.status}
                      onClick={() => handleStatusUpdate(ticket.id, btn.status)}
                      disabled={ticket.status === btn.status || updating === ticket.id + btn.status}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold
                                  transition-all hover:scale-105 shadow-lg disabled:opacity-40
                                  disabled:cursor-not-allowed ${btn.color}`}
                    >
                      {updating === ticket.id + btn.status ? (
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      ) : null}
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}