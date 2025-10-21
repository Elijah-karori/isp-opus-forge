// src/api/backend.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// attach auth token if exists (adjust to your auth store)
api.interceptors.request.use((cfg) => {
  try {
    const token = localStorage.getItem("access_token");
    if (token) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` };
  } catch (e) {}
  return cfg;
});

export default api;
