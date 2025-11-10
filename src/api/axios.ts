import axios from "axios";

<<<<<<< HEAD
const baseURL = import.meta.env.VITE_API_BASE_URL?.endsWith("/api/v1")
  ? import.meta.env.VITE_API_BASE_URL
  : `${import.meta.env.VITE_API_BASE_URL}/api/v1`;
=======
const baseURL = import.meta.env.VITE_API_BASE || "http://localhost:8000/api/v1";
>>>>>>> 90af223791f4f52c0355176f6b76de27744082b4

const instance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
