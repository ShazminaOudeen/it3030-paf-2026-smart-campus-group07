// booking/components/BookingFormModal.jsx
// ─── Module B entry point ───────────────────────────────────────────────────
// This modal is opened when the user clicks "Book Now" from the resource detail.
// It handles the full booking form (date, time range, purpose, attendees).
// Implementation is owned by Member 2 (Booking module).

import { useState, useCallback } from "react";
import { X, Calendar, Clock, Users, FileText, Loader2, CheckCircle } from "lucide-react";
import axios from "axios";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Always returns today's date string in YYYY-MM-DD, evaluated at call time. */
const getToday = () => new Date().toISOString().split("T")[0];

const baseInputClass = `
  w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600
  bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200
  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50
  focus:border-amber-400 transition-all
`.trim();

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, error, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
        {Icon && <Icon size={11} className="opacity-60" />}
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`${baseInputClass} ${className}`}
      {...props}
    />
  );
}

// ─── Initial form state factory ───────────────────────────────────────────────

const makeInitialForm = () => ({
  bookingDate: getToday(),
  startTime: "09:00",
  endTime: "10:00",
  purpose: "",
  expectedAttendees: "",
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingFormModal({ resource, onClose, onSuccess }) {
  const [form, setForm] = useState(makeInitialForm);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const today  = getToday(); // evaluated per render so it stays current
  const isRoom = resource.type !== "EQUIPMENT"; // attendees field only shown for rooms/facilities

  const set = useCallback((k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  }, []);

  // ─── Validation ─────────────────────────────────────────────────────────────

  const validate = () => {
    const e = {};

    if (!form.bookingDate) {
      e.bookingDate = "Date is required";
    } else if (form.bookingDate < today) {
      e.bookingDate = "Date cannot be in the past";
    }

    if (!form.startTime) e.startTime = "Start time is required";
    if (!form.endTime)   e.endTime   = "End time is required";

    if (form.startTime && form.endTime && form.startTime >= form.endTime)
      e.endTime = "End time must be after start time";

    if (!form.purpose.trim())
      e.purpose = "Purpose is required";

    // Attendees — only validated when the field is shown (i.e. rooms/facilities)
    if (isRoom) {
      const attendees = Number(form.expectedAttendees);
      if (form.expectedAttendees !== "" && attendees < 1)
        e.expectedAttendees = "Must be at least 1";
      if (resource.capacity && form.expectedAttendees !== "" && attendees > resource.capacity)
        e.expectedAttendees = `Cannot exceed room capacity of ${resource.capacity}`;
    }

    return e;
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    try {
      await axios.post("/api/bookings", {
        resourceId:        resource.id,
        bookingDate:       form.bookingDate,
        startTime:         form.startTime + ":00",
        endTime:           form.endTime   + ":00",
        purpose:           form.purpose.trim(),
        expectedAttendees: isRoom && form.expectedAttendees !== ""
                             ? Number(form.expectedAttendees)
                             : null,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1800);

    } catch (err) {
      const msg = err.response?.data?.message ?? "Booking failed. Please try again.";
      if (err.response?.status === 409) {
        setErrors({ _conflict: msg });
      } else {
        setErrors({ _general: msg });
      }
    } finally {
      setLoading(false);
    }
  };
  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Book ${resource.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl
        border border-gray-100 dark:border-gray-700 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100
          dark:border-gray-700 bg-amber-50 dark:bg-amber-500/10">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">New Booking Request</h2>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 font-medium truncate max-w-[260px]">
              {resource.name}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-500/20 text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Success State ── */}
        {success ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center
              justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Booking Submitted!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your request is pending admin approval.
            </p>
          </div>

        ) : (
          <>
            <div className="p-6 space-y-4">

              {/* Global conflict / general error banners */}
              {errors._conflict && (
                <div role="alert" className="flex items-start gap-2 px-4 py-3 rounded-xl
                  bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30
                  text-sm text-red-600 dark:text-red-400">
                  <Clock size={15} className="mt-0.5 shrink-0" />
                  <span>{errors._conflict}</span>
                </div>
              )}
              {errors._general && (
                <div role="alert" className="flex items-start gap-2 px-4 py-3 rounded-xl
                  bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30
                  text-sm text-red-600 dark:text-red-400">
                  <span>{errors._general}</span>
                </div>
              )}

              {/* Date */}
              <Field label="Booking Date *" error={errors.bookingDate} icon={Calendar}>
                <Input
                  type="date"
                  min={today}
                  value={form.bookingDate}
                  aria-required="true"
                  onChange={(e) => set("bookingDate", e.target.value)}
                />
              </Field>

              {/* Time range */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start Time *" error={errors.startTime} icon={Clock}>
                  <Input
                    type="time"
                    value={form.startTime}
                    aria-required="true"
                    onChange={(e) => set("startTime", e.target.value)}
                  />
                </Field>
                <Field label="End Time *" error={errors.endTime} icon={Clock}>
                  <Input
                    type="time"
                    value={form.endTime}
                    aria-required="true"
                    onChange={(e) => set("endTime", e.target.value)}
                  />
                </Field>
              </div>

              {/* Purpose */}
              <Field label="Purpose *" error={errors.purpose} icon={FileText}>
                <textarea
                  rows={3}
                  placeholder="Describe the purpose of this booking…"
                  value={form.purpose}
                  aria-required="true"
                  onChange={(e) => set("purpose", e.target.value)}
                  className={`${baseInputClass} resize-none`}
                />
              </Field>

              {/* Expected Attendees — hidden for equipment, shown for rooms/facilities */}
              {isRoom && (
                <Field
                  label={resource.capacity
                    ? `Expected Attendees (max ${resource.capacity})`
                    : "Expected Attendees"}
                  error={errors.expectedAttendees}
                  icon={Users}
                >
                  <Input
                    type="number"
                    min="1"
                    max={resource.capacity || undefined}
                    placeholder={resource.capacity ? `Up to ${resource.capacity} people` : "Number of attendees"}
                    value={form.expectedAttendees}
                    onChange={(e) => set("expectedAttendees", e.target.value)}
                  />
                </Field>
              )}

              <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
                * Bookings are subject to admin approval. You'll be notified once reviewed.
              </p>
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t
              border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
                  hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600
                  text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Calendar size={15} />
                }
                Submit Request
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}