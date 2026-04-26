// booking/api/bookingsApi.js
import axios from "axios";

const BASE = "/api/bookings";

// ── USER ──────────────────────────────────────────────────────────────────────

export const createBooking  = (data) => axios.post(BASE, data);
export const getMyBookings  = ()     => axios.get(`${BASE}/my`);
export const getBookingById = (id)   => axios.get(`${BASE}/${id}`);
export const cancelBooking  = (id)   => axios.patch(`${BASE}/${id}/cancel`, {});

// ── ADMIN ─────────────────────────────────────────────────────────────────────

export const getAllBookings  = (status) =>
  axios.get(BASE, { params: status ? { status } : {} });

export const getPendingBookings = () =>
  axios.get(`${BASE}/pending`);

export const reviewBooking = (id, action, rejectionReason) =>
  axios.put(`${BASE}/${id}/review`, { action, rejectionReason });

// ── QR CHECK-IN (public — no auth needed) ─────────────────────────────────────

export const verifyQrToken = (token) => axios.get(`${BASE}/checkin/${token}`);