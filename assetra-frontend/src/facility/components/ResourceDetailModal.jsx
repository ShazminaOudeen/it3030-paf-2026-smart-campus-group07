// facility/components/ResourceDetailModal.jsx
import { X, MapPin, Users, Clock, Calendar, AlertTriangle, CheckCircle2, Wrench } from "lucide-react";
import { StatusBadge } from "./ResourceCard";

const TYPE_LABELS = {
  LECTURE_HALL: "Lecture Hall", LAB: "Laboratory",
  MEETING_ROOM: "Meeting Room", EQUIPMENT: "Equipment",
  AUDITORIUM: "Auditorium", STUDY_ROOM: "Study Room",
};

const STATUS_ICON = {
  ACTIVE: <CheckCircle2 size={16} className="text-green-500" />,
  OUT_OF_SERVICE: <AlertTriangle size={16} className="text-red-500" />,
  UNDER_MAINTENANCE: <Wrench size={16} className="text-amber-500" />,
};

const STATUS_MSG = {
  ACTIVE: null,
  OUT_OF_SERVICE: "This resource is currently out of service and cannot be booked.",
  UNDER_MAINTENANCE: "This resource is under maintenance and temporarily unavailable.",
};

export default function ResourceDetailModal({ resource, onClose, onBookNow }) {
  if (!resource) return null;

  const canBook = resource.status === "ACTIVE" && resource.isAvailableNow !== false;
  const notAvailableMsg =
    resource.status !== "ACTIVE"
      ? STATUS_MSG[resource.status]
      : !resource.isAvailableNow
      ? `This resource is only available during ${resource.availabilityWindow || "specified hours"}.`
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl
        border border-gray-100 dark:border-gray-700 overflow-hidden">

        {/* Hero image / header */}
        {resource.imageUrl ? (
          <div className="relative h-44 overflow-hidden">
            <img src={resource.imageUrl} alt={resource.name}
              className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <button onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-xl bg-black/30 hover:bg-black/50
                text-white backdrop-blur-sm transition-colors">
              <X size={16} />
            </button>
            <div className="absolute bottom-3 left-4">
              <p className="text-xs text-white/70 font-medium uppercase tracking-widest">
                {TYPE_LABELS[resource.type] || resource.type}
              </p>
              <h2 className="text-lg font-bold text-white">{resource.name}</h2>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest mb-0.5">
                {TYPE_LABELS[resource.type] || resource.type}
              </p>
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">{resource.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={resource.status} />
              <button onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {resource.location && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <MapPin size={16} className="text-orange-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{resource.location}</p>
                </div>
              </div>
            )}
            {resource.capacity && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <Users size={16} className="text-orange-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Capacity</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{resource.capacity} seats</p>
                </div>
              </div>
            )}
            {resource.availabilityWindow && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <Clock size={16} className="text-orange-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Available Hours</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{resource.availabilityWindow}</p>
                </div>
              </div>
            )}
            {resource.activeBookingsCount !== undefined && resource.activeBookingsCount !== null && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <Calendar size={16} className="text-orange-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Active Bookings</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {resource.activeBookingsCount} booking{resource.activeBookingsCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {resource.description && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                About
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{resource.description}</p>
            </div>
          )}

          {/* Availability notice */}
          {notAvailableMsg && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10
              border border-red-100 dark:border-red-500/20">
              <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{notAvailableMsg}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100
          dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
              hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            Close
          </button>
          <button
            onClick={() => canBook && onBookNow(resource)}
            disabled={!canBook}
            title={!canBook ? (notAvailableMsg || "Not available") : "Book this resource"}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all
              ${canBook
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 hover:shadow-orange-500/30"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              }`}
          >
            <Calendar size={15} />
            {canBook ? "Book Now" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
}
