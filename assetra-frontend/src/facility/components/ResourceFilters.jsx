// facility/components/ResourceFilters.jsx
import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

const RESOURCE_TYPES = [
  { value: "", label: "All Types" },
  { value: "LECTURE_HALL", label: "Lecture Hall" },
  { value: "LAB", label: "Laboratory" },
  { value: "MEETING_ROOM", label: "Meeting Room" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "AUDITORIUM", label: "Auditorium" },
  { value: "STUDY_ROOM", label: "Study Room" },
];

const STATUSES = [
  { value: "", label: "Any Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "OUT_OF_SERVICE", label: "Out of Service" },
  { value: "UNDER_MAINTENANCE", label: "Under Maintenance" },
];

export default function ResourceFilters({ filters, onChange, isAdmin = false }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = (e) => {
    if (e.key === "Enter") onChange({ search: e.target.value });
  };

  const clearAll = () =>
    onChange({ type: "", status: "", minCapacity: "", location: "", search: "", page: 0 });

  const hasActiveFilters =
    filters.type || filters.status || filters.minCapacity ||
    filters.location || filters.search;

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            defaultValue={filters.search || ""}
            onKeyDown={handleSearch}
            onChange={(e) => !e.target.value && onChange({ search: "" })}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50
              focus:border-orange-400 transition-all"
          />
        </div>
        <button
          onClick={() => setShowAdvanced((p) => !p)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
            ${showAdvanced
              ? "bg-orange-50 dark:bg-orange-500/10 border-orange-300 dark:border-orange-500/30 text-orange-600 dark:text-orange-400"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
            }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-orange-500" />
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-gray-200
              dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-500
              hover:text-red-500 hover:border-red-300 transition-all"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl
          bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
          
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Type</label>
            <select
              value={filters.type || ""}
              onChange={(e) => onChange({ type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200
                focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            >
              {RESOURCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Status</label>
              <select
                value={filters.status || ""}
                onChange={(e) => onChange({ status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                  bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200
                  focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Min. Capacity
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 30"
              value={filters.minCapacity || ""}
              onChange={(e) => onChange({ minCapacity: e.target.value || undefined })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200
                focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Location</label>
            <input
              type="text"
              placeholder="e.g. Block A"
              value={filters.location || ""}
              onChange={(e) => onChange({ location: e.target.value || undefined })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200
                focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
