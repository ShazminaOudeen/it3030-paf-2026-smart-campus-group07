import { useEffect, useState } from "react";
import { getAllTickets, assignTechnician } from "../api/ticketApi";

const PRIORITY_COLORS = {
  LOW: "text-emerald-400 bg-emerald-500/10",
  MEDIUM: "text-amber-400 bg-amber-500/10",
  HIGH: "text-orange-400 bg-orange-500/10",
  CRITICAL: "text-red-400 bg-red-500/10",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function AdminAssignTechnicianPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [technicianId, setTechnicianId] = useState("");
  const [inputError, setInputError] = useState("");
  const [assigning, setAssigning] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getAllTickets()
      .then((res) => setTickets(res.data.filter((t) => t.status === "OPEN")))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const handleIdChange = (e) => {
    setTechnicianId(e.target.value);
    setInputError("");
    setError("");
  };

  const handleAssign = async (ticketId) => {
    if (!technicianId.trim()) {
      setInputError("Please enter a technician ID");
      return;
    }
    if (!UUID_REGEX.test(technicianId.trim())) {
      setInputError("Invalid UUID format — e.g. 00000000-0000-0000-0000-000000000002");
      return;
    }

    setAssigning(ticketId);
    setError("");
    try {
      await assignTechnician(ticketId, technicianId.trim());
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      setSuccess("Technician assigned successfully!");
      setTechnicianId("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to assign technician. Check the ID and try again."
      );
    } finally {
      setAssigning(null);
    }
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
        .fade-up { animation: fadeUp 0.4s ease both; }
        .ticket-row { animation: fadeUp 0.3s ease both; }
      `}</style>

      {/* Header */}
      <div className="fade-up mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Assign Technician</h1>
            <p className="text-gray-400 text-sm">{tickets.length} open tickets awaiting assignment</p>
          </div>
        </div>
      </div>

      {/* Success banner */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Technician ID input */}
      <div className="fade-up p-5 rounded-2xl border border-white/8 bg-white/4 mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Technician ID <span className="text-gray-500">(UUID)</span>
        </label>
        <input
          type="text"
          value={technicianId}
          onChange={handleIdChange}
          placeholder="e.g. 00000000-0000-0000-0000-000000000002"
          className={`w-full px-4 py-2.5 rounded-xl border text-white text-sm placeholder-gray-600
                     bg-white/4 focus:outline-none transition-all
                     ${inputError
                       ? "border-red-500/50 focus:border-red-500"
                       : "border-white/8 focus:border-orange-500/50 focus:bg-orange-500/5"
                     }`}
        />
        {inputError ? (
          <p className="text-xs text-red-400 mt-2">{inputError}</p>
        ) : (
          <p className="text-xs text-gray-600 mt-2">
            Enter the technician's UUID then click Assign on any ticket below
          </p>
        )}
      </div>

      {/* Tickets list */}
      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium mb-1">All caught up!</p>
          <p className="text-gray-600 text-sm">No open tickets to assign.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket, i) => {
            const pc = PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.MEDIUM;
            return (
              <div
                key={ticket.id}
                className="ticket-row p-5 rounded-2xl border border-white/8 bg-white/4
                           hover:border-orange-500/20 transition-all duration-200 flex items-center justify-between gap-4"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-white">{ticket.category}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pc}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate mb-1">{ticket.description}</p>
                  <p className="text-xs text-gray-600">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleAssign(ticket.id)}
                  disabled={assigning === ticket.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600
                             text-white text-sm font-semibold transition-all hover:scale-105
                             disabled:opacity-50 whitespace-nowrap shadow-lg shadow-orange-500/20"
                >
                  {assigning === ticket.id ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                  {assigning === ticket.id ? "Assigning..." : "Assign"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}