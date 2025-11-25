import axios from "axios"
import { useAuthStore } from "../store/authStore"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  getUsers: () => api.get("/auth/users"),
}

// Drug API
export const drugAPI = {
  getAll: (params) => api.get("/drugs", { params }),
  getById: (id) => api.get(`/drugs/${id}`),
  create: (data) => api.post("/drugs", data),
  update: (id, data) => api.put(`/drugs/${id}`, data),
  delete: (id) => api.delete(`/drugs/${id}`),
  getStats: () => api.get("/drugs/stats"),
  scanQR: (data) => api.post("/drugs/scan", data),
  regenerateQR: (id) => api.post(`/drugs/${id}/regenerate-qr`),
}

// Movement API
export const movementAPI = {
  getAll: (params) => api.get("/movements", { params }),
  getById: (id) => api.get(`/movements/${id}`),
  create: (data) => api.post("/movements", data),
  updateStatus: (id, data) => api.put(`/movements/${id}/status`, data),
  scan: (id, data) => api.put(`/movements/${id}/scan`, data),
  assignDriver: (id, data) => api.put(`/movements/${id}/assign-driver`, data),
  getStats: () => api.get("/movements/stats"),
}

// Alert API
export const alertAPI = {
  getAll: (params) => api.get("/alerts", { params }),
  markAsRead: (id) => api.put(`/alerts/${id}/read`),
  markAllAsRead: () => api.put("/alerts/read-all"),
  resolve: (id) => api.put(`/alerts/${id}/resolve`),
  getExpiry: (params) => api.get("/alerts/expiry", { params }),
  getLowStock: () => api.get("/alerts/low-stock"),
  create: (data) => api.post("/alerts", data),
}

// Report API
export const reportAPI = {
  getDashboard: () => api.get("/reports/dashboard"),
  getInventory: (params) => api.get("/reports/inventory", { params }),
  getMovement: (params) => api.get("/reports/movement", { params }),
  getExpiry: (params) => api.get("/reports/expiry", { params }),
  getConsumption: (params) => api.get("/reports/consumption", { params }),
}

// Upload API
export const uploadAPI = {
  single: (formData) =>
    api.post("/upload/single", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  multiple: (formData) =>
    api.post("/upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (publicId) => api.delete(`/upload/${publicId}`),
}

export default api
