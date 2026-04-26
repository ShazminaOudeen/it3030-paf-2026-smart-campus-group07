// booking/api/bookingsApi.js
import axios from "axios";

const BASE = "/api/bookings";

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

export const createBooking      = (data)   => axios.post(BASE, data, auth());
export const getMyBookings      = ()       => axios.get(`${BASE}/my`, auth());
export const getBookingById     = (id)     => axios.get(`${BASE}/${id}`, auth());
export const cancelBooking      = (id)     => axios.patch(`${BASE}/${id}/cancel`, {}, auth());
export const getAllBookings      = (status) => axios.get(BASE, { ...auth(), params: status ? { status } : {} });
export const getPendingBookings  = ()       => axios.get(`${BASE}/pending`, auth());
export const reviewBooking       = (id, action, rejectionReason) =>
  axios.put(`${BASE}/${id}/review`, { action, rejectionReason }, auth());
export const verifyQrToken = (token) => axios.get(`${BASE}/checkin/${token}`);