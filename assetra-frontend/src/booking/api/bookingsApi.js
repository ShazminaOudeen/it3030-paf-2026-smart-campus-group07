// booking/api/bookingsApi.js
// All Axios calls for Module B — Booking Management

import axios from "axios";

const BASE = "/api/bookings";

// ── USER ─────────────────────────────────────────────────────────────────────

/** Create a new booking request */
export const createBooking = (data) => axios.post(BASE, data);

/** Get the authenticated user's bookings */
export const getMyBookings = () => axios.get(`${BASE}/my`);

/** Get a single booking by ID */
export const getBookingById = (id) => axios.get(`${BASE}/${id}`);

/** Cancel a booking */
export const cancelBooking = (id) => axios.patch(`${BASE}/${id}/cancel`);

// ── ADMIN ─────────────────────────────────────────────────────────────────────

/** Get all bookings (admin), optionally filtered by status */
export const getAllBookings = (status) =>
  axios.get(BASE, { params: status ? { status } : {} });

/** Get all pending bookings (admin shortcut) */
export const getPendingBookings = () => axios.get(`${BASE}/pending`);

/** Approve or reject a booking */
export const reviewBooking = (id, action, rejectionReason) =>
  axios.put(`${BASE}/${id}/review`, { action, rejectionReason });

// ── QR CHECK-IN ───────────────────────────────────────────────────────────────

/** Verify a QR token (public — no auth needed) */
export const verifyQrToken = (token) => axios.get(`${BASE}/checkin/${token}`);