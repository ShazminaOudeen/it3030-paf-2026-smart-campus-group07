// facility/hooks/useResources.js
import { useState, useEffect, useCallback } from "react";
import { facilitiesApi } from "../api/facilitiesApi";

/**
 * Hook for paginated, filtered resource listing.
 */
export function useResources(initialFilters = {}) {
  const [resources, setResources]   = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [filters, setFilters]       = useState({
    page: 0, size: 12, sortBy: "createdAt", sortDir: "desc", ...initialFilters,
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await facilitiesApi.getAll(filters);
      setResources(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateFilters = (patch) =>
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 0 }));

  return { resources, totalPages, totalElements, loading, error, filters, updateFilters, refetch: fetch };
}

/**
 * Hook for a single resource detail.
 */
export function useResource(id) {
  const [resource, setResource] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await facilitiesApi.getById(id);
      setResource(data);
    } catch (err) {
      setError(err.response?.data?.message || "Resource not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { resource, loading, error, refetch: fetch };
}

/**
 * Hook for admin stats.
 */
export function useResourceStats() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    facilitiesApi.getStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}
