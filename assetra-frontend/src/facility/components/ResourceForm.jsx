// facility/components/ResourceForm.jsx
import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";

const TYPES = [
  { value: "LECTURE_HALL", label: "Lecture Hall" },
  { value: "LAB", label: "Laboratory" },
  { value: "MEETING_ROOM", label: "Meeting Room" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "AUDITORIUM", label: "Auditorium" },
  { value: "STUDY_ROOM", label: "Study Room" },
];

const STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "OUT_OF_SERVICE", label: "Out of Service" },
  { value: "UNDER_MAINTENANCE", label: "Under Maintenance" },
];

const EMPTY = {
  name: "", type: "LAB", capacity: "", location: "",
  availabilityWindow: "08:00-18:00", status: "ACTIVE",
  description: "", imageUrl: "",
};

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600
        bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200
        placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50
        focus:border-orange-400 transition-all ${className}`}
      {...props}
    />
  );
}

export default function ResourceForm({ initial = null, onSubmit, onClose, loading = false }) {
  const [form, setForm] = useState(initial ? {
    name: initial.name || "",
    type: initial.type || "LAB",
    capacity: initial.capacity || "",
    location: initial.location || "",
    availabilityWindow: initial.availabilityWindow || "08:00-18:00",
    status: initial.status || "ACTIVE",
    description: initial.description || "",
    imageUrl: initial.imageUrl || "",
  } : { ...EMPTY });

  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.type) e.type = "Type is required";
    if (form.capacity && (isNaN(form.capacity) || Number(form.capacity) < 1))
      e.capacity = "Capacity must be a positive number";
    if (form.availabilityWindow &&
      !/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(form.availabilityWindow))
      e.availabilityWindow = "Format must be HH:mm-HH:mm";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit({
      ...form,
      capacity: form.capacity ? Number(form.capacity) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl
        border border-gray-100 dark:border-gray-700 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">
              {initial ? "Edit Resource" : "Add Resource"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {initial ? "Update resource details" : "Create a new bookable resource"}
            </p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Resource Name *" error={errors.name}>
            <Input
              placeholder="e.g. Computer Lab A101"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Type *" error={errors.type}>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600
                  bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200
                  focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              >
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>

            <Field label="Status" error={errors.status}>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600
                  bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200
                  focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              >
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Capacity (seats)" error={errors.capacity}>
              <Input
                type="number" min="1"
                placeholder="e.g. 40"
                value={form.capacity}
                onChange={(e) => set("capacity", e.target.value)}
              />
            </Field>

            <Field label="Availability Window" error={errors.availabilityWindow}>
              <Input
                placeholder="08:00-18:00"
                value={form.availabilityWindow}
                onChange={(e) => set("availabilityWindow", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Location" error={errors.location}>
            <Input
              placeholder="e.g. Block A, Floor 2"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </Field>

          <Field label="Description" error={errors.description}>
            <textarea
              rows={3}
              placeholder="Brief description of the resource..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600
                bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50
                resize-none transition-all"
            />
          </Field>

          <Field label="Image URL (optional)" error={errors.imageUrl}>
            <Input
              placeholder="https://..."
              value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
              hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600
              text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {initial ? "Save Changes" : "Create Resource"}
          </button>
        </div>
      </div>
    </div>
  );
}
