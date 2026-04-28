import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8082/api";

const api = axios.create({ baseURL: API_BASE });

// ── Always reads the current logged-in user's ID from localStorage ──
// This ensures the correct user ID is sent even when the component
// receives a stale or incorrect userId prop
const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id || "";
  } catch {
    return "";
  }
};

export const createTicket = (formData, userId) =>
  api.post("/tickets", formData, {
    headers: {
      "X-User-Id": userId || getUserId(),
      "Content-Type": "multipart/form-data",
    },
  });

export const getAllTickets = () => api.get("/tickets");

export const getMyTickets = (userId) =>
  api.get("/tickets/my", {
    headers: { "X-User-Id": userId || getUserId() },
  });

export const getTicketById = (id) => api.get(`/tickets/${id}`);

export const assignTechnician = (ticketId, technicianId) =>
  api.put(`/tickets/${ticketId}/assign`, { technicianId });

export const updateTicketStatus = (ticketId, data) =>
  api.patch(`/tickets/${ticketId}/status`, data);

export const getComments = (ticketId) =>
  api.get(`/tickets/${ticketId}/comments`);

// ── Fixed: always uses live localStorage ID, never a stale prop ──
export const addComment = (ticketId, content, userId) =>
  api.post(
    `/tickets/${ticketId}/comments`,
    { content },
    { headers: { "X-User-Id": getUserId() || userId } }
  );

export const updateComment = (commentId, content, userId) =>
  api.put(
    `/tickets/comments/${commentId}`,
    { content },
    { headers: { "X-User-Id": getUserId() || userId } }
  );

export const deleteComment = (commentId, userId) =>
  api.delete(`/tickets/comments/${commentId}`, {
    headers: { "X-User-Id": getUserId() || userId },
  });

// GET all technicians from user service
export const getTechnicians = () =>
  axios
    .get(`${API_BASE}/users`)
    .then((res) => res.data.filter((u) => u.role === "TECHNICIAN"));