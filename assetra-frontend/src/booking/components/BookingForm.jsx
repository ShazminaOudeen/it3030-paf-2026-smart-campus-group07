// booking/components/BookingForm.jsx
import { useState, useEffect, useMemo } from "react";
import { CalendarDays, Clock, Users, FileText, Loader2, AlertTriangle } from "lucide-react";
import axios from "axios";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parses "HH:mm-HH:mm" availability window.
 * Returns { startMins, endMins, windowLabel } or null if not set / malformed.
 */
function parseAvailabilityWindow(availabilityWindow) {
  if (!availabilityWindow) return null;
  try {
    const [startStr, endStr] = availabilityWindow.split("-");
    const [startH, startM]   = startStr.trim().split(":").map(Number);
    const [endH,   endM]     = endStr.trim().split(":").map(Number);
    const fmt = (h, m) =>
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    return {
      startMins:   startH * 60 + startM,
      endMins:     endH   * 60 + endM,
      windowLabel: `${fmt(startH, startM)} – ${fmt(endH, endM)}`,
    };
  } catch {
    return null; // malformed — fail open
  }
}

/**
 * Returns true if a "HH:mm" time string falls within [startMins, endMins].
 */
function timeWithinWindow(timeStr, startMins, endMins) {
  if (!timeStr) return true; // not filled in yet — don't block
  const [h, m] = timeStr.split(":").map(Number);
  const mins   = h * 60 + m;
  return mins >= startMins && mins <= endMins;
}

// ─── Component ────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split("T")[0];

const inputClass = `w-full px-3 py-2 rounded-xl text-sm border border-gray-200
  dark:border-white/[0.1] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
  focus:outline-none focus:ring-2 focus:ring-orange-400 transition`;

const labelClass = "text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block";

export default function BookingForm({ onSubmit, loading, error }) {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({
    resourceId:        "",
    bookingDate:       "",
    startTime:         "",
    endTime:           "",
    purpose:           "",
    expectedAttendees: "",
  });

  // Fetch active resources once
  useEffect(() => {
    axios.get("/api/resources?status=ACTIVE")
      .then(({ data }) => {
        setResources(Array.isArray(data) ? data : (data?.content ?? []));
      })
      .catch(() => setResources([]));
  }, []);

  // Derive the full selected resource object from the current resourceId
  const selectedResource = useMemo(
    () => resources.find((r) => r.id === form.resourceId) ?? null,
    [resources, form.resourceId]
  );

  const isEquipment = selectedResource?.type === "EQUIPMENT";

  // Parse the availability window for the selected resource
  const windowInfo = useMemo(
    () => parseAvailabilityWindow(selectedResource?.availabilityWindow),
    [selectedResource]
  );

  // Check if start/end times violate the window
  const startOutside = windowInfo
    ? !timeWithinWindow(form.startTime, windowInfo.startMins, windowInfo.endMins)
    : false;
  const endOutside = windowInfo
    ? !timeWithinWindow(form.endTime, windowInfo.startMins, windowInfo.endMins)
    : false;
  const anyOutside = startOutside || endOutside;

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Reset attendees when switching to equipment
  const handleResourceChange = (e) => {
    const id = e.target.value;
    setForm((prev) => ({
      ...prev,
      resourceId:        id,
      expectedAttendees: "",
      startTime:         "",
      endTime:           "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (anyOutside) return; // guard — button should already be disabled
    onSubmit({
      ...form,
      expectedAttendees: !isEquipment && form.expectedAttendees
        ? Number(form.expectedAttendees)
        : undefined,
    });
  };

  // Build min/max for time inputs when a window is defined
  const windowMinTime = windowInfo
    ? `${String(Math.floor(windowInfo.startMins / 60)).padStart(2, "0")}:${String(windowInfo.startMins % 60).padStart(2, "0")}`
    : undefined;
  const windowMaxTime = windowInfo
    ? `${String(Math.floor(windowInfo.endMins / 60)).padStart(2, "0")}:${String(windowInfo.endMins % 60).padStart(2, "0")}`
    : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* API / submission error */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50
          dark:bg-red-500/10 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Resource */}
      <div>
        <label className={labelClass}>Resource</label>
        <select
          value={form.resourceId}
          onChange={handleResourceChange}
          required
          className={inputClass}
        >
          <option value="">Select a resource…</option>
          {resources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {r.type}{r.location ? ` (${r.location})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Availability window violation banner */}
      {selectedResource && windowInfo && anyOutside && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl
          bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30
          text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          <span>
            <span className="font-semibold">{selectedResource.name}</span> is only bookable
            between <span className="font-semibold">{windowInfo.windowLabel}</span>.
            Please adjust your selected times.
          </span>
        </div>
      )}

      {/* Availability window info — shown when inside the window */}
      {selectedResource && windowInfo && !anyOutside && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30
          text-xs text-green-700 dark:text-green-400">
          <Clock size={12} className="shrink-0" />
          Available window: <span className="font-semibold ml-1">{windowInfo.windowLabel}</span>
        </div>
      )}

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
          min={TODAY}
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
          <input
            type="time"
            value={form.startTime}
            onChange={set("startTime")}
            min={windowMinTime}
            max={windowMaxTime}
            required
            className={`${inputClass} ${startOutside ? "border-amber-400 ring-1 ring-amber-400" : ""}`}
          />
          {startOutside && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Must be within {windowInfo.windowLabel}
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>End Time</label>
          <input
            type="time"
            value={form.endTime}
            onChange={set("endTime")}
            min={windowMinTime}
            max={windowMaxTime}
            required
            className={`${inputClass} ${endOutside ? "border-amber-400 ring-1 ring-amber-400" : ""}`}
          />
          {endOutside && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Must be within {windowInfo.windowLabel}
            </p>
          )}
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

      {/* Expected Attendees — disabled for equipment */}
      <div>
        <label className={`${labelClass} flex items-center gap-1.5`}>
          <Users size={12} />
          Expected Attendees
          {isEquipment && (
            <span className="ml-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md
              bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 normal-case tracking-normal">
              not applicable for equipment
            </span>
          )}
        </label>
        <input
          type="number"
          value={form.expectedAttendees}
          onChange={set("expectedAttendees")}
          min={1}
          max={selectedResource?.capacity || undefined}
          placeholder={
            isEquipment
              ? "N/A"
              : selectedResource?.capacity
                ? `Up to ${selectedResource.capacity} people`
                : "e.g. 25"
          }
          disabled={isEquipment}
          className={`${inputClass} ${
            isEquipment
              ? "opacity-40 cursor-not-allowed bg-gray-50 dark:bg-gray-900"
              : ""
          }`}
        />
        {!isEquipment && selectedResource?.capacity && (
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Max capacity: {selectedResource.capacity}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || anyOutside}
        title={anyOutside ? `Booking only allowed ${windowInfo?.windowLabel}` : undefined}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
          bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed
          text-white font-semibold text-sm transition-colors"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? "Submitting…" : "Request Booking"}
      </button>
    </form>
  );
}