import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;

const authHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

export const getNotifications = (userId, token) =>
    axios.get(`${API}/notifications/user/${userId}`, authHeaders(token));

export const getUnreadCount = (userId, token) =>
    axios.get(`${API}/notifications/user/${userId}/unread-count`, authHeaders(token));

export const markAsRead = (id, token) =>
    axios.patch(`${API}/notifications/${id}/read`, {}, authHeaders(token));

export const markAllAsRead = (userId, token) =>
    axios.patch(`${API}/notifications/user/${userId}/read-all`, {}, authHeaders(token));

export const deleteNotification = (id, token) =>
    axios.delete(`${API}/notifications/${id}`, authHeaders(token));