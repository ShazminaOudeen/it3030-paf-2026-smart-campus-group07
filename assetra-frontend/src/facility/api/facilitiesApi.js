// facility/api/facilitiesApi.js
import axios from "axios";

const BASE = "/api/resources";

// Call this once when the app loads / token changes
export function setAuthToken(token) {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
}

export const facilitiesApi = {
  getAll: (params = {}) =>
    axios.get(BASE, { params }).then((r) => r.data),

  getById: (id) => axios.get(`${BASE}/${id}`).then((r) => r.data),

  create: (data) => axios.post(BASE, data).then((r) => r.data),

  update: (id, data) => axios.put(`${BASE}/${id}`, data).then((r) => r.data),

  updateStatus: (id, status) =>
    axios.patch(`${BASE}/${id}/status`, null, { params: { status } }).then((r) => r.data),

  remove: (id) => axios.delete(`${BASE}/${id}`).then((r) => r.data),

  getStats: () => axios.get(`${BASE}/stats`).then((r) => r.data),
};