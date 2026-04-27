// facility/pages/user/UserFacilitiesPage.jsx.
import { useState } from "react";
import { Layers, Loader2, AlertCircle } from "lucide-react";
import { useResources } from "../hooks/useResources";
import ResourceCard from "../components/ResourceCard";
import ResourceFilters from "../components/ResourceFilters";
import ResourceDetailModal from "../components/ResourceDetailModal";
import BookingFormModal from "../../booking/components/BookingFormModal";

export default function UserFacilitiesPage() {
  const { resources, totalPages, totalElements, loading, error, filters, updateFilters } =
    useResources({ status: "" }); // users see all statuses but can only book ACTIVE

  const [selectedResource, setSelectedResource] = useState(null);
  const [bookingResource, setBookingResource]   = useState(null);

  const handleBookNow = (resource) => {
    setSelectedResource(null);   // close detail modal
    setBookingResource(resource); // open booking form
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Browse Resources</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Find and book available facilities and equipment
        </p>
      </div>

      {/* Filters — user version (no status filter) */}
      <ResourceFilters filters={filters} onChange={updateFilters} isAdmin={false} />

      {/* Result count */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{totalElements} resource{totalElements !== 1 ? "s" : ""} found</span>
        <select
          value={`${filters.sortBy},${filters.sortDir}`}
          onChange={(e) => {
            const [sortBy, sortDir] = e.target.value.split(",");
            updateFilters({ sortBy, sortDir });
          }}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600
            bg-white dark:bg-gray-800 text-sm focus:outline-none"
        >
          <option value="createdAt,desc">Newest first</option>
          <option value="name,asc">Name A–Z</option>
          <option value="capacity,desc">Most capacity</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-amber-400" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10
          border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400">
          <AlertCircle size={18} /> {error}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <Layers size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No resources found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} onClick={setSelectedResource} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => updateFilters({ page: filters.page - 1 })}
            disabled={filters.page === 0}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm
              disabled:opacity-40 hover:border-amber-300 transition-all"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {filters.page + 1} of {totalPages}
          </span>
          <button
            onClick={() => updateFilters({ page: filters.page + 1 })}
            disabled={filters.page >= totalPages - 1}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm
              disabled:opacity-40 hover:border-amber-300 transition-all"
          >
            Next →
          </button>
        </div>
      )}

      {/* Resource detail modal */}
      {selectedResource && (
        <ResourceDetailModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          onBookNow={handleBookNow}
        />
      )}

      {/* Booking form modal (Module B) */}
      {bookingResource && (
        <BookingFormModal
          resource={bookingResource}
          onClose={() => setBookingResource(null)}
          onSuccess={() => {
            setBookingResource(null);
            // optionally navigate to /user/bookings
          }}
        />
      )}
    </div>
  );
}
