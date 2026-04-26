// facility/components/ResourceForm.jsx
import { useState } from "react";
import { X, Loader2, Save, Building2 } from "lucide-react";

const TYPES = [
  { value: "LECTURE_HALL", label: "Lecture hall" },
  { value: "LAB",          label: "Laboratory" },
  { value: "MEETING_ROOM", label: "Meeting room" },
  { value: "EQUIPMENT",    label: "Equipment" },
  { value: "AUDITORIUM",   label: "Auditorium" },
  { value: "STUDY_ROOM",   label: "Study room" },
];

const STATUSES = [
  { value: "ACTIVE",            label: "Active",          ring: "green" },
  { value: "OUT_OF_SERVICE",    label: "Out of service",  ring: "red" },
  { value: "UNDER_MAINTENANCE", label: "Maintenance",     ring: "amber" },
];

const STATUS_STYLES = {
  ACTIVE:            "border-green-400 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  OUT_OF_SERVICE:    "border-red-400 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  UNDER_MAINTENANCE: "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
};

const EMPTY = {
  name: "", type: "LAB", capacity: "",
  location: "", windowStart: "08:00", windowEnd: "18:00",
  status: "ACTIVE", description: "", imageUrl: "",
};

// Parse "HH:mm-HH:mm" → { windowStart, windowEnd }
function splitWindow(raw = "") {
  const [s = "08:00", e = "18:00"] = raw.split("-");
  return { windowStart: s, windowEnd: e };
}

// Validate a single HH:mm token
function validTime(t) {
  if (!/^\d{2}:\d{2}$/.test(t)) return false;
  const [h, m] = t.split(":").map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

// Convert HH:mm to minutes-since-midnight
function toMins(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400
        mb-1.5 uppercase tracking-widest">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{hint}</p>
      )}
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600
        bg-white dark:bg-gray-700/60 text-sm text-gray-800 dark:text-gray-200
        placeholder-gray-400 dark:placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400
        transition-all ${className}`}
      {...props}
    />
  );
}

export default function ResourceForm({ initial = null, onSubmit, onClose, loading = false }) {
  const [form, setForm] = useState(() => {
    if (!initial) return { ...EMPTY };
    const { windowStart, windowEnd } = splitWindow(initial.availabilityWindow);
    return {
      name:        initial.name        || "",
      type:        initial.type        || "LAB",
      capacity:    initial.capacity    || "",
      location:    initial.location    || "",
      windowStart,
      windowEnd,
      status:      initial.status      || "ACTIVE",
      description: initial.description || "",
      imageUrl:    initial.imageUrl    || "",
    };
  });

  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};

    if (!form.name.trim()) {
      e.name = "Name is required";
    }
    if (!form.type) {
      e.type = "Type is required";
    }
    if (form.capacity && (isNaN(form.capacity) || Number(form.capacity) < 1)) {
      e.capacity = "Must be a positive number";
    }

    // Availability window — two separate fields
    const startOk = validTime(form.windowStart);
    const endOk   = validTime(form.windowEnd);

    if (!startOk) {
      e.window = "Start time must be in HH:mm format (00:00 – 23:59)";
    } else if (!endOk) {
      e.window = "End time must be in HH:mm format (00:00 – 23:59)";
    } else if (toMins(form.windowEnd) <= toMins(form.windowStart)) {
      e.window = "End time must be after start time";
    }

    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit({
      ...form,
      capacity:           form.capacity ? Number(form.capacity) : null,
      availabilityWindow: `${form.windowStart}-${form.windowEnd}`,
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl
        border border-gray-100 dark:border-gray-700 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4
          border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-500/10
              border border-orange-100 dark:border-orange-500/20
              flex items-center justify-center">
              <Building2 size={16} className="text-orange-500" />
            </div>
            <div>
              <h2 className="font-semibold text-[15px] text-gray-900 dark:text-white leading-none">
                {initial ? "Edit resource" : "Add resource"}
              </h2>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">
                {initial ? "Update resource details" : "Create a new bookable resource"}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
              text-gray-400 dark:text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-5 max-h-[68vh] overflow-y-auto">

          {/* Name */}
          <Field label="Resource name *" error={errors.name}>
            <Input
              placeholder="e.g. Computer Lab A101"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>

          {/* Type — pill grid (fixes LECTURE_HALL label casing too) */}
          <Field label="Type *" error={errors.type}>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set("type", t.value)}
                  className={`py-2 px-3 rounded-xl border text-[12.5px] font-medium transition-all text-center
                    ${form.type === t.value
                      ? "border-orange-400 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"
                      : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-orange-200"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Capacity + Location */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Capacity (seats)" error={errors.capacity}>
              <Input
                type="number" min="1"
                placeholder="e.g. 40"
                value={form.capacity}
                onChange={(e) => set("capacity", e.target.value)}
              />
            </Field>
            <Field label="Location" error={errors.location}>
              <Input
                placeholder="e.g. Block A, Floor 2"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </Field>
          </div>

          {/* Availability window — split into two inputs */}
          <Field
            label="Availability window"
            error={errors.window}
            hint="24-hour format · End must be after start"
          >
            <div className="flex items-center gap-2">
              <Input
                placeholder="08:00"
                value={form.windowStart}
                onChange={(e) => set("windowStart", e.target.value)}
                className={`text-center ${errors.window ? "border-red-400 focus:ring-red-400/30 focus:border-red-400" : ""}`}
              />
              <span className="text-gray-400 dark:text-gray-500 text-sm flex-shrink-0">→</span>
              <Input
                placeholder="18:00"
                value={form.windowEnd}
                onChange={(e) => set("windowEnd", e.target.value)}
                className={`text-center ${errors.window ? "border-red-400 focus:ring-red-400/30 focus:border-red-400" : ""}`}
              />
            </div>
          </Field>

          {/* Status — pill selector */}
          <Field label="Status" error={errors.status}>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set("status", s.value)}
                  className={`px-3.5 py-1.5 rounded-full border text-[12.5px] font-medium transition-all
                    ${form.status === s.value
                      ? STATUS_STYLES[s.value]
                      : "border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Description */}
          <Field label="Description" error={errors.description}>
            <textarea
              rows={3}
              placeholder="Brief description of the resource…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600
                bg-white dark:bg-gray-700/60 text-sm text-gray-800 dark:text-gray-200
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400
                resize-none transition-all"
            />
          </Field>

          {/* Image URL — collapsed/optional look */}
          <Field label="Image URL (optional)" error={errors.imageUrl}>
            <Input
              placeholder="https://…"
              value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
            />
          </Field>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4
          border-t border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400
              hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600
              text-white text-sm font-semibold transition-colors
              disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-orange-500/20"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {initial ? "Save changes" : "Create resource"}
          </button>
        </div>
      </div>
    </div>
  );
}