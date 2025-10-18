import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE || "http://localhost:8000/api/v1";

const instance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
