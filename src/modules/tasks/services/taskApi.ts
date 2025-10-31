import { apiClient } from "@/lib/api";

export const TaskApi = {
  getAll: () => apiClient.get("/tasks"),
  getById: (id: number) => apiClient.get(`/tasks/${id}`),
  create: (data: any) => apiClient.post("/tasks", data),
  update: (id: number, data: any) => apiClient.patch(`/tasks/${id}`, data),
  updateBOM: (id: number, data: any) => apiClient.post(`/tasks/${id}/update-bom`, data),
  approveBOM: (id: number, approve: boolean) =>
    apiClient.post(`/tasks/${id}/approve-bom?approve=${approve}`),
};
