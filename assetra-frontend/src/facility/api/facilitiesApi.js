// facility/api/facilitiesApi.js
import axios from "axios";

const BASE = "/api/resources";

export const facilitiesApi = {
  /**
   * GET /api/resources
   * @param {Object} params - { type, status, minCapacity, location, search, page, size, sortBy, sortDir }
   */
  getAll: (params = {}) =>
    axios.get(BASE, { params }).then((r) => r.data),

  /**
   * GET /api/resources/:id
   */
  getById: (id) => axios.get(`${BASE}/${id}`).then((r) => r.data),

  /**
   * POST /api/resources  (ADMIN)
   */
  create: (data) => axios.post(BASE, data).then((r) => r.data),

  /**
   * PUT /api/resources/:id  (ADMIN)
   */
  update: (id, data) => axios.put(`${BASE}/${id}`, data).then((r) => r.data),

  /**
   * PATCH /api/resources/:id/status  (ADMIN)
   */
  updateStatus: (id, status) =>
    axios.patch(`${BASE}/${id}/status`, null, { params: { status } }).then((r) => r.data),

  /**
   * DELETE /api/resources/:id  (ADMIN)
   */
  remove: (id) => axios.delete(`${BASE}/${id}`).then((r) => r.data),

  /**
   * GET /api/resources/stats  (ADMIN)
   */
  getStats: () => axios.get(`${BASE}/stats`).then((r) => r.data),
};
