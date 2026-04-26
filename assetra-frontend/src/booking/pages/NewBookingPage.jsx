// booking/pages/NewBookingPage.jsx  (User — Make a Booking)
import { useNavigate } from "react-router-dom";
import { PlusSquare, CheckCircle } from "lucide-react";
import { useCreateBooking } from "../hooks/useBookings";
import BookingForm from "../components/BookingForm";

export default function NewBookingPage() {
  const navigate = useNavigate();
  const { submit, loading, error, success } = useCreateBooking();

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
        <CheckCircle size={56} className="text-green-500" />
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Booking Submitted!</h2>
          <p className="text-sm text-gray-400 mt-1">
            Your request is pending admin approval. You'll receive a notification once it's reviewed.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/user/bookings")}
            className="text-sm font-semibold px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600
              text-white transition-colors"
          >
            View My Bookings
          </button>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-medium px-4 py-2 rounded-xl border border-gray-200
              dark:border-white/[0.1] text-gray-600 dark:text-gray-300
              hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <PlusSquare size={20} className="text-amber-500" />
          Make a Booking
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Fill in the details below to request a resource booking.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.07]
        rounded-2xl p-6 shadow-sm">
        <BookingForm onSubmit={submit} loading={loading} error={error} />
      </div>
    </div>
  );
}