import { apiClient } from '@/lib/api';

const axios = apiClient.axios;

export const login = (email: string, password: string) =>
  axios.post("/auth/login", { username: email, password });

export const register = (payload: any) =>
  axios.post("/auth/register", payload);

export const getMe = () =>
  axios.get("/auth/me");
