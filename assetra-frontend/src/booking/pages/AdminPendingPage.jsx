// booking/pages/AdminPendingPage.jsx  (Admin — Pending Approvals)
import { ClipboardCheck, RefreshCw } from "lucide-react";
import { usePendingBookings } from "../hooks/useBookings";
import BookingCard from "../components/BookingCard";

export default function AdminPendingPage() {
  const { bookings, loading, error, refetch, review } = usePendingBookings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck size={20} className="text-orange-500" />
            Pending Approvals
            {bookings.length > 0 && (
              <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full
                bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                {bookings.length}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Bookings awaiting your review
          </p>
        </div>
        <button
          onClick={refetch}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <RefreshCw size={15} className="text-gray-400" />
        </button>
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
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <ClipboardCheck size={40} className="text-gray-300 dark:text-gray-700" />
          <p className="text-sm text-gray-400">All caught up — no pending bookings.</p>
        </div>
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