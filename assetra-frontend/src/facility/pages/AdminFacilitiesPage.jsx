// facility/pages/admin/AdminFacilitiesPage.jsx.
import { useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, BarChart3, Loader2, AlertCircle } from "lucide-react";
import { useResources, useResourceStats } from "../hooks/useResources";
import { facilitiesApi } from "../api/facilitiesApi";
import ResourceCard from "../components/ResourceCard";
import ResourceFilters from "../components/ResourceFilters";
import ResourceForm from "../components/ResourceForm";

function StatCard({ label, value, color = "orange" }) {
  const colors = {
    orange: "from-orange-50 to-orange-100/50 dark:from-orange-500/10 dark:to-orange-500/5 border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-400",
    green:  "from-green-50 to-green-100/50 dark:from-green-500/10 dark:to-green-500/5 border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400",
    red:    "from-red-50 to-red-100/50 dark:from-red-500/10 dark:to-red-500/5 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400",
    amber:  "from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-500/5 border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4`}>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color].split(" ").slice(-2).join(" ")}`}>{value ?? "—"}</p>
    </div>
  );
}

export default function AdminFacilitiesPage() {
  const { resources, totalPages, totalElements, loading, error, filters, updateFilters, refetch } =
    useResources();
  const { stats } = useResourceStats();

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      await facilitiesApi.create(data);
      setShowForm(false);
      refetch();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to create resource");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    setSubmitting(true);
    try {
      await facilitiesApi.update(editTarget.id, data);
      setEditTarget(null);
      refetch();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to update resource");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await facilitiesApi.remove(id);
      setDeleteConfirm(null);
      refetch();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to delete resource");
    }
  };

  const handleToggleStatus = async (resource) => {
    const next = resource.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";
    try {
      await facilitiesApi.updateStatus(resource.id, next);
      refetch();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  // Safe resource list — never undefined
  const resourceList = resources ?? [];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resources</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage all bookable facilities and assets
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600
            text-white text-sm font-semibold transition-colors shadow-md shadow-orange-500/20"
        >
          <Plus size={16} /> Add Resource
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Resources" value={stats.total} color="orange" />
          <StatCard label="Active" value={stats.active} color="green" />
          <StatCard label="Out of Service" value={stats.outOfService} color="red" />
          <StatCard label="Under Maintenance" value={stats.underMaintenance} color="amber" />
        </div>
      )}

      {/* Filters */}
      <ResourceFilters filters={filters} onChange={updateFilters} isAdmin />

      {/* Result count */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{totalElements ?? 0} resource{totalElements !== 1 ? "s" : ""} found</span>
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
          <option value="createdAt,asc">Oldest first</option>
          <option value="name,asc">Name A–Z</option>
          <option value="name,desc">Name Z–A</option>
          <option value="capacity,desc">Most capacity</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-orange-400" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10
          border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400">
          <AlertCircle size={18} /> {error}
        </div>
      ) : resourceList.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No resources found</p>
          <p className="text-sm mt-1">Try adjusting your filters or add a new resource</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {resourceList.map((r) => (
            <div key={r.id} className="relative group">
              <ResourceCard resource={r} onClick={() => {}} />
              {/* Admin action overlay */}
              <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleToggleStatus(r)}
                  title={r.status === "ACTIVE" ? "Set Out of Service" : "Set Active"}
                  className="p-1.5 rounded-lg bg-white dark:bg-gray-700 shadow-md border
                    border-gray-200 dark:border-gray-600 hover:border-orange-300 transition-all"
                >
                  {r.status === "ACTIVE"
                    ? <ToggleRight size={14} className="text-green-500" />
                    : <ToggleLeft size={14} className="text-gray-400" />
                  }
                </button>
                <button
                  onClick={() => setEditTarget(r)}
                  className="p-1.5 rounded-lg bg-white dark:bg-gray-700 shadow-md border
                    border-gray-200 dark:border-gray-600 hover:border-orange-300 transition-all"
                >
                  <Pencil size={14} className="text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(r)}
                  className="p-1.5 rounded-lg bg-white dark:bg-gray-700 shadow-md border
                    border-gray-200 dark:border-gray-600 hover:border-red-300 transition-all"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>
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
              disabled:opacity-40 hover:border-orange-300 transition-all"
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
              disabled:opacity-40 hover:border-orange-300 transition-all"
          >
            Next →
          </button>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <ResourceForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          loading={submitting}
        />
      )}
      {editTarget && (
        <ResourceForm
          initial={editTarget}
          onSubmit={handleUpdate}
          onClose={() => setEditTarget(null)}
          loading={submitting}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Delete Resource?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                "{deleteConfirm.name}" will be removed. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600
                  text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600
                  text-white text-sm font-semibold transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}