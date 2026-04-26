// booking/api/bookingsApi.js
import axios from "axios";

const BASE = "/api/bookings";

// ── Helper: attach JWT token from localStorage ────────────────────────────────
const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// ── USER ──────────────────────────────────────────────────────────────────────

export const createBooking  = (data) => axios.post(BASE, data, authHeaders());
export const getMyBookings  = ()     => axios.get(`${BASE}/my`, authHeaders());
export const getBookingById = (id)   => axios.get(`${BASE}/${id}`, authHeaders());
export const cancelBooking = (id) => axios.patch(`${BASE}/${id}/cancel`, {}, authHeaders());

// ── ADMIN ─────────────────────────────────────────────────────────────────────

export const getAllBookings  = (status) =>
  axios.get(BASE, { ...authHeaders(), params: status ? { status } : {} });

export const getPendingBookings = () =>
  axios.get(`${BASE}/pending`, authHeaders());

export const reviewBooking = (id, action, rejectionReason) =>
  axios.put(`${BASE}/${id}/review`, { action, rejectionReason }, authHeaders());

// ── QR CHECK-IN (public — no auth needed) ─────────────────────────────────────

export const verifyQrToken = (token) => axios.get(`${BASE}/checkin/${token}`);