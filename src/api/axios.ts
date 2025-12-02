import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL?.endsWith("/api/v1")
  ? import.meta.env.VITE_API_BASE_URL
  : `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

const instance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Automatically unwrap data from responses
instance.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default instance;
