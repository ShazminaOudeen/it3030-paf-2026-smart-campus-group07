// booking/pages/AdminBookingsPage.jsx  (Admin — All Bookings)
import { useState } from "react";
import { ListChecks, RefreshCw } from "lucide-react";
import { useAllBookings } from "../hooks/useBookings";
import BookingCard from "../components/BookingCard";

const STATUS_OPTIONS = ["", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const { bookings, loading, error, refetch, review } = useAllBookings(statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ListChecks size={20} className="text-orange-500" />
            All Bookings
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Review and manage all booking requests</p>
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/[0.1]
              bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none
              focus:ring-2 focus:ring-orange-400"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s || "All Statuses"}</option>
            ))}
          </select>

          <button
            onClick={refetch}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <RefreshCw size={15} className="text-gray-400" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">No bookings found.</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onReview={review}
            isAdmin={true}
          />
        ))}
      </div>
    </div>
  );
}