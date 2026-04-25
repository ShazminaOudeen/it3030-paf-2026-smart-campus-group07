import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8082/api";

const api = axios.create({ baseURL: API_BASE });

export const createTicket = (formData, userId) =>
  api.post("/tickets", formData, {
    headers: { "X-User-Id": userId, "Content-Type": "multipart/form-data" },
  });

export const getAllTickets = () => api.get("/tickets");

export const getMyTickets = (userId) =>
  api.get("/tickets/my", { headers: { "X-User-Id": userId } });

export const getTicketById = (id) => api.get(`/tickets/${id}`);

export const assignTechnician = (ticketId, technicianId) =>
  api.put(`/tickets/${ticketId}/assign`, { technicianId });

export const updateTicketStatus = (ticketId, data) =>
  api.patch(`/tickets/${ticketId}/status`, data);

export const getComments = (ticketId) =>
  api.get(`/tickets/${ticketId}/comments`);

export const addComment = (ticketId, content, userId) =>
  api.post(`/tickets/${ticketId}/comments`, { content }, {
    headers: { "X-User-Id": userId },
  });

export const updateComment = (commentId, content, userId) =>
  api.put(`/tickets/comments/${commentId}`, { content }, {
    headers: { "X-User-Id": userId },
  });

export const deleteComment = (commentId, userId) =>
  api.delete(`/tickets/comments/${commentId}`, {
    headers: { "X-User-Id": userId },
  });