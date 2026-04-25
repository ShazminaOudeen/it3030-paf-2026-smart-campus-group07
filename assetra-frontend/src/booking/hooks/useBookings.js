// booking/hooks/useBookings.js
import { useState, useEffect, useCallback } from "react";
import {
  getMyBookings,
  getAllBookings,
  getPendingBookings,
  createBooking,
  reviewBooking,
  cancelBooking,
} from "../api/bookingsApi";

// ── USER hook ─────────────────────────────────────────────────────────────────

export function useMyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getMyBookings();
      // Guarantee we always set an array
      setBookings(Array.isArray(data) ? data : data?.content ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const cancel = async (id) => {
    await cancelBooking(id);
    fetch();
  };

  return { bookings, loading, error, refetch: fetch, cancel };
}

// ── ADMIN: all bookings hook ──────────────────────────────────────────────────

export function useAllBookings(statusFilter) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getAllBookings(statusFilter);
      setBookings(Array.isArray(data) ? data : data?.content ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const review = async (id, action, rejectionReason) => {
    await reviewBooking(id, action, rejectionReason);
    fetch();
  };

  return { bookings, loading, error, refetch: fetch, review };
}

// ── ADMIN: pending bookings hook ──────────────────────────────────────────────

export function usePendingBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getPendingBookings();
      setBookings(Array.isArray(data) ? data : data?.content ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load pending bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const review = async (id, action, rejectionReason) => {
    await reviewBooking(id, action, rejectionReason);
    fetch();
  };

  return { bookings, loading, error, refetch: fetch, review };
}

// ── CREATE hook ───────────────────────────────────────────────────────────────

export function useCreateBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submit = async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await createBooking(formData);
      setSuccess(true);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error, success };
}