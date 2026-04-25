import { useEffect, useState } from "react";
import { getAllTickets, updateTicketStatus } from "../api/ticketApi";

const STATUS_COLORS = {
  OPEN: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  RESOLVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CLOSED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function TechnicianAssignedPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const technicianId = "00000000-0000-0000-0000-000000000002"; // temp until auth done

  useEffect(() => {
    getAllTickets()
      .then((res) =>
        setTickets(res.data.filter((t) => t.assignedTo === technicianId))
      )
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (ticketId, status) => {
    try {
      await updateTicketStatus(ticketId, {
        status,
        resolutionNotes: notes[ticketId] || "",
      });
      setTickets((prev) =>
        prev.map((t) => t.id === ticketId ? { ...t, status } : t)
      );
    } catch {
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Assigned to Me</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {tickets.length} ticket(s) assigned to you
      </p>

      {tickets.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">No tickets assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800
                         bg-white dark:bg-gray-900"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {ticket.category}
                    </span>
                    <span className="text-xs text-orange-500 font-medium">{ticket.priority}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{ticket.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_COLORS[ticket.status]}`}>
                  {ticket.status.replace("_", " ")}
                </span>
              </div>

              <textarea
                placeholder="Add resolution notes..."
                value={notes[ticket.id] || ""}
                onChange={(e) => setNotes({ ...notes, [ticket.id]: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700
                           bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300
                           focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none mb-3"
              />

              <div className="flex gap-2 flex-wrap">
                {["IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusUpdate(ticket.id, s)}
                    disabled={ticket.status === s}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                      ${ticket.status === s
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                  >
                    Mark {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}