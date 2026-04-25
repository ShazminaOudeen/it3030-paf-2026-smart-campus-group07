import { useEffect, useState } from "react";
import { getAllTickets } from "../api/ticketApi";

export default function TechnicianResolvedPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const technicianId = "00000000-0000-0000-0000-000000000002"; // temp until auth done

  useEffect(() => {
    getAllTickets()
      .then((res) =>
        setTickets(
          res.data.filter(
            (t) =>
              (t.status === "RESOLVED" || t.status === "CLOSED") &&
              t.assignedTo === technicianId
          )
        )
      )
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Resolved Tickets</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Your resolved and closed tickets — {tickets.length} found
      </p>

      {tickets.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">No resolved tickets yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800
                         bg-white dark:bg-gray-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {ticket.category}
                    </span>
                    <span className="text-xs text-orange-500">{ticket.priority}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {ticket.description}
                  </p>
                  {ticket.resolutionNotes && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      ✓ {ticket.resolutionNotes}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                  ${ticket.status === "RESOLVED"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}>
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