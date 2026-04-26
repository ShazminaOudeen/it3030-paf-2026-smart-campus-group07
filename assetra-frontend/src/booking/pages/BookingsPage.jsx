// booking/pages/BookingsPage.jsx  (User — My Bookings)
import { useState } from "react";
import { CalendarDays, RefreshCw } from "lucide-react";
import { useMyBookings } from "../hooks/useBookings";
import BookingCard from "../components/BookingCard";

const STATUS_TABS = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

export default function BookingsPage() {
  const { bookings, loading, error, refetch, cancel } = useMyBookings();
  const [activeTab, setActiveTab] = useState("ALL");

  const filtered = activeTab === "ALL"
    ? bookings
    : bookings.filter((b) => b.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays size={20} className="text-amber-500" />
            My Bookings
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Track and manage your booking requests</p>
        </div>
        <button
          onClick={refetch}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <RefreshCw size={15} className="text-gray-400" />
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors
              ${activeTab === tab
                ? "bg-amber-500 text-white"
                : "bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">
          No bookings found for this filter.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onCancel={cancel}
            isAdmin={false}
          />
        ))}
      </div>
    </div>
  );
}