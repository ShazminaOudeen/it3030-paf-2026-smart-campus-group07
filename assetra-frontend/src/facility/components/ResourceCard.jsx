// facility/components/ResourceCard.jsx.
import { MapPin, Users, Clock, Layers, ChevronRight } from "lucide-react";

const TYPE_LABELS = {
  LECTURE_HALL: "Lecture Hall",
  LAB: "Laboratory",
  MEETING_ROOM: "Meeting Room",
  EQUIPMENT: "Equipment",
  AUDITORIUM: "Auditorium",
  STUDY_ROOM: "Study Room",
};

const TYPE_COLORS = {
  LECTURE_HALL: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  LAB: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
  MEETING_ROOM: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  EQUIPMENT: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  AUDITORIUM: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
  STUDY_ROOM: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
};

export function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20",
    OUT_OF_SERVICE: "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20",
    UNDER_MAINTENANCE: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
  };
  const labels = {
    ACTIVE: "Active",
    OUT_OF_SERVICE: "Out of Service",
    UNDER_MAINTENANCE: "Under Maintenance",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === "ACTIVE" ? "bg-green-500" :
        status === "OUT_OF_SERVICE" ? "bg-red-500" : "bg-amber-500"
      }`} />
      {labels[status]}
    </span>
  );
}

export default function ResourceCard({ resource, onClick }) {
  const isAvailable = resource.status === "ACTIVE";

  return (
    <button
      onClick={() => onClick(resource)}
      className="group w-full text-left bg-white dark:bg-gray-800 rounded-2xl border border-gray-100
        dark:border-gray-700/50 p-5 hover:border-orange-300 dark:hover:border-orange-500/40
        hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-200 relative overflow-hidden"
    >
      {/* availability strip */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${
        isAvailable ? "bg-green-400" : "bg-gray-300 dark:bg-gray-600"
      }`} />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${TYPE_COLORS[resource.type] || TYPE_COLORS.EQUIPMENT}`}>
            {TYPE_LABELS[resource.type] || resource.type}
          </span>
        </div>
        <StatusBadge status={resource.status} />
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1 group-hover:text-orange-600
        dark:group-hover:text-orange-400 transition-colors line-clamp-1">
        {resource.name}
      </h3>

      {resource.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {resource.description}
        </p>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
        {resource.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {resource.location}
          </span>
        )}
        {resource.capacity && (
          <span className="flex items-center gap-1">
            <Users size={12} /> {resource.capacity} seats
          </span>
        )}
        {resource.availabilityWindow && (
          <span className="flex items-center gap-1">
            <Clock size={12} /> {resource.availabilityWindow}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={`text-xs font-medium ${
          isAvailable ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"
        }`}>
          {isAvailable ? "Available to book" : "Currently unavailable"}
        </span>
        <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-orange-400
          group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
}
