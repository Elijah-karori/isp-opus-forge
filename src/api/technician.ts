import { apiClient } from '@/lib/api';

const axios = apiClient.axios;

export const createTechnicianRequest = (payload: any) =>
  axios.post("/technician/requests", payload);

export const fetchMyTasks = () =>
  axios.get("/tasks/my");
