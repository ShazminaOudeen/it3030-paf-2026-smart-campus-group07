// booking/components/BookingForm.jsx
import { useState, useEffect } from "react";
import { CalendarDays, Clock, Users, FileText, Loader2 } from "lucide-react";
import axios from "axios";

export default function BookingForm({ onSubmit, loading, error }) {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({
    resourceId: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
  });

  useEffect(() => {
    axios.get("/api/resources?status=ACTIVE")
      .then(({ data }) => {
        // Handle plain array or paginated { content: [] }
        setResources(Array.isArray(data) ? data : data?.content ?? []);
      })
      .catch(() => setResources([]));
  }, []);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      expectedAttendees: form.expectedAttendees ? Number(form.expectedAttendees) : undefined,
    });
  };

  const inputClass = `w-full px-3 py-2 rounded-xl text-sm border border-gray-200
    dark:border-white/[0.1] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
    focus:outline-none focus:ring-2 focus:ring-orange-400 transition`;

  const labelClass = "text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10
          rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Resource */}
      <div>
        <label className={labelClass}>Resource</label>
        <select value={form.resourceId} onChange={set("resourceId")} required className={inputClass}>
          <option value="">Select a resource…</option>
          {resources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {r.type} {r.location ? `(${r.location})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className={labelClass}>
          <CalendarDays size={12} className="inline mr-1" />
          Booking Date
        </label>
        <input
          type="date"
          value={form.bookingDate}
          onChange={set("bookingDate")}
          min={new Date().toISOString().split("T")[0]}
          required
          className={inputClass}
        />
      </div>

      {/* Time range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>
            <Clock size={12} className="inline mr-1" />
            Start Time
          </label>
          <input type="time" value={form.startTime} onChange={set("startTime")} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>End Time</label>
          <input type="time" value={form.endTime} onChange={set("endTime")} required className={inputClass} />
        </div>
      </div>

      {/* Purpose */}
      <div>
        <label className={labelClass}>
          <FileText size={12} className="inline mr-1" />
          Purpose
        </label>
        <textarea
          value={form.purpose}
          onChange={set("purpose")}
          rows={3}
          placeholder="Describe the purpose of this booking…"
          required
          maxLength={500}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Attendees */}
      <div>
        <label className={labelClass}>
          <Users size={12} className="inline mr-1" />
          Expected Attendees
        </label>
        <input
          type="number"
          value={form.expectedAttendees}
          onChange={set("expectedAttendees")}
          min={1}
          placeholder="e.g. 25"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
          bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold
          text-sm transition-colors"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? "Submitting…" : "Request Booking"}
      </button>
    </form>
  );
}