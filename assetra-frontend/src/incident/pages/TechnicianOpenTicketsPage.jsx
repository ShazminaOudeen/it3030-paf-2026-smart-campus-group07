import { useEffect, useState } from "react";
import { getAllTickets } from "../api/ticketApi";

const PRIORITY_COLORS = {
  LOW: "text-green-600 dark:text-green-400",
  MEDIUM: "text-yellow-600 dark:text-yellow-400",
  HIGH: "text-orange-600 dark:text-orange-400",
  CRITICAL: "text-red-600 dark:text-red-400",
};

export default function TechnicianOpenTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTickets()
      .then((res) =>
        setTickets(res.data.filter((t) => t.status === "OPEN" && !t.assignedTo))
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">All Open Tickets</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Unassigned open tickets — {tickets.length} found
      </p>

      {tickets.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">No open unassigned tickets.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800
                         bg-white dark:bg-gray-900"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {ticket.category}
                </span>
                <span className={`text-xs font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {ticket.description}
              </p>
              <p className="text-xs text-gray-400">
                Reported: {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}