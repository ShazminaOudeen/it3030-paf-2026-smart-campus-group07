// booking/pages/QrCheckInPage.jsx  — Public check-in verification screen
// Route: /checkin/:token
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { verifyQrToken } from "../api/bookingsApi";
import {
  CheckCircle2, XCircle, Calendar, Clock, MapPin, User, Loader2, QrCode,
} from "lucide-react";

export default function QrCheckInPage() {
  const { token } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyQrToken(token)
      .then(({ data }) => setResult(data))
      .catch(() =>
        setResult({ valid: false, message: "Unable to verify. Please try again." })
      )
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo bar */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <QrCode size={22} className="text-orange-500" />
          <span className="font-bold text-gray-800 dark:text-white">Assetra Check-in</span>
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-4 py-16">
            <Loader2 size={40} className="animate-spin text-orange-500" />
            <p className="text-sm text-gray-400">Verifying booking…</p>
          </div>
        )}

        {!loading && result && (
          <div className={`rounded-2xl border p-6 shadow-lg space-y-5 bg-white dark:bg-gray-900
            ${result.valid
              ? "border-green-200 dark:border-green-500/30"
              : "border-red-200 dark:border-red-500/30"
            }`}
          >
            {/* Status icon + message */}
            <div className="flex flex-col items-center text-center gap-3">
              {result.valid
                ? <CheckCircle2 size={56} className="text-green-500" />
                : <XCircle size={56} className="text-red-500" />
              }
              <div>
                <p className={`text-lg font-bold ${result.valid ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {result.valid ? "Check-in Successful" : "Invalid Booking"}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">{result.message}</p>
              </div>
            </div>

            {/* Booking details */}
            {result.valid && (
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                <Row icon={<User size={14} />} label="Booked by" value={result.userName} />
                <Row icon={<MapPin size={14} />} label="Resource" value={`${result.resourceName}${result.resourceLocation ? ` · ${result.resourceLocation}` : ""}`} />
                <Row icon={<Calendar size={14} />} label="Date" value={result.bookingDate} />
                <Row icon={<Clock size={14} />} label="Time" value={`${result.startTime} – ${result.endTime}`} />
                {result.purpose && (
                  <Row icon={<span />} label="Purpose" value={result.purpose} />
                )}
              </div>
            )}

            {/* Booking ID (small) */}
            {result.bookingId && (
              <p className="text-[10px] text-center text-gray-300 dark:text-gray-600 font-mono break-all">
                ID: {result.bookingId}
              </p>
            )}
          </div>
        )}

        <p className="text-center text-[10px] text-gray-300 dark:text-gray-700 mt-6 font-mono">
          Assetra · Smart Campus Operations Hub
        </p>
      </div>
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-gray-400 shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
        <p className="text-sm text-gray-800 dark:text-gray-200">{value}</p>
      </div>
    </div>
  );
}