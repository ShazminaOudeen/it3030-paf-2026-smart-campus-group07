import { useEffect, useState } from "react";
import { getAllTickets, assignTechnician } from "../api/ticketApi";

export default function AdminAssignTechnicianPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [technicianId, setTechnicianId] = useState("");
  const [assigning, setAssigning] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getAllTickets()
      .then((res) => setTickets(res.data.filter((t) => t.status === "OPEN")))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAssign = async (ticketId) => {
    if (!technicianId.trim()) {
      alert("Please enter a technician ID");
      return;
    }
    setAssigning(ticketId);
    try {
      await assignTechnician(ticketId, technicianId);
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      setSuccess("Technician assigned successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert("Failed to assign technician");
    } finally {
      setAssigning(null);
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        Assign Technician
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Assign technicians to open tickets
      </p>

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">
          {success}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Technician ID
        </label>
        <input
          type="text"
          value={technicianId}
          onChange={(e) => setTechnicianId(e.target.value)}
          placeholder="Enter technician UUID"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">No open tickets to assign.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800
                         bg-white dark:bg-gray-900 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {ticket.category}
                  </span>
                  <span className="text-xs text-orange-500 font-medium">{ticket.priority}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {ticket.description}
                </p>
              </div>
              <button
                onClick={() => handleAssign(ticket.id)}
                disabled={assigning === ticket.id}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600
                           text-white text-sm font-semibold transition-all
                           disabled:opacity-50 whitespace-nowrap"
              >
                {assigning === ticket.id ? "Assigning..." : "Assign"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}