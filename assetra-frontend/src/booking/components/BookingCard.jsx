// booking/components/BookingCard.jsx
import { Calendar, Clock, MapPin, Users, QrCode, X } from "lucide-react";
import BookingStatusBadge from "./BookingStatusBadge";
import { useState } from "react";
import QRCode from "react-qr-code"; // npm install react-qr-code

/**
 * Displays a single booking card for both User and Admin views.
 * Props:
 *   booking   — booking object from API
 *   onCancel  — (id) => void  (optional, user only)
 *   onReview  — (id, action, reason) => void  (optional, admin only)
 *   isAdmin   — boolean
 */
export default function BookingCard({ booking, onCancel, onReview, isAdmin }) {
  const [showQr, setShowQr] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const qrUrl = `${window.location.origin}/checkin/${booking.qrToken}`;

  const handleApprove = () => onReview?.(booking.id, "APPROVED", "");
  const handleReject = () => {
    if (!rejectionReason.trim()) return;
    onReview?.(booking.id, "REJECTED", rejectionReason);
    setShowReject(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.07]
      rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">
            {booking.resourceName}
          </p>
          {isAdmin && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {booking.userName} · {booking.userEmail}
            </p>
          )}
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <Calendar size={13} />
          {booking.bookingDate}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={13} />
          {booking.startTime} – {booking.endTime}
        </span>
        {booking.resourceLocation && (
          <span className="flex items-center gap-1.5 col-span-2">
            <MapPin size={13} />
            {booking.resourceLocation}
          </span>
        )}
        {booking.expectedAttendees && (
          <span className="flex items-center gap-1.5">
            <Users size={13} />
            {booking.expectedAttendees} attendees
          </span>
        )}
      </div>

      {booking.purpose && (
        <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.03]
          rounded-lg px-3 py-2 border border-gray-100 dark:border-white/[0.05]">
          {booking.purpose}
        </p>
      )}

      {booking.rejectionReason && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10
          rounded-lg px-3 py-2">
          Rejected: {booking.rejectionReason}
        </p>
      )}

      {/* QR Code section — approved bookings only */}
      {booking.status === "APPROVED" && booking.qrToken && (
        <div>
          <button
            onClick={() => setShowQr((p) => !p)}
            className="flex items-center gap-2 text-xs font-medium text-orange-500 dark:text-orange-400
              hover:underline"
          >
            <QrCode size={14} />
            {showQr ? "Hide QR Code" : "Show QR Code for Check-in"}
          </button>

          {showQr && (
            <div className="mt-3 flex flex-col items-center gap-2 p-4
              bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/[0.08]">
              <QRCode value={qrUrl} size={140} />
              <p className="text-[10px] text-gray-400 text-center break-all">{qrUrl}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap pt-1">
        {/* User: cancel pending or approved */}
        {!isAdmin && onCancel && ["PENDING", "APPROVED"].includes(booking.status) && (
          <button
            onClick={() => onCancel(booking.id)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
              border border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <X size={13} /> Cancel Booking
          </button>
        )}

        {/* Admin: approve / reject pending */}
        {isAdmin && booking.status === "PENDING" && (
          <>
            <button
              onClick={handleApprove}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600
                text-white transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => setShowReject((p) => !p)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600
                text-white transition-colors"
            >
              Reject
            </button>
          </>
        )}
      </div>

      {/* Inline rejection reason input */}
      {showReject && (
        <div className="flex gap-2 items-center">
          <input
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Reason for rejection…"
            className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-200
              dark:border-white/[0.1] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
              focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <button
            onClick={handleReject}
            className="text-xs font-medium px-3 py-2 rounded-lg bg-red-500 text-white
              hover:bg-red-600 transition-colors"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}