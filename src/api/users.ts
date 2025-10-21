import api from "./axios";

export async function getUsers() {
  const res = await api.get("/api/v1/users/users/");
  return res.data;
}

export async function createUser(userData: any) {
  const res = await api.post("/api/v1/users/users/", userData);
  return res.data;
}

export async function updateUser(userId: number, userData: any) {
  const res = await api.put(`/api/v1/users/users/${userId}`, userData);
  return res.data;
}

export async function deleteUser(userId: number) {
  const res = await api.delete(`/api/v1/users/users/${userId}`);
  return res.data;
}

export async function restoreUser(userId: number) {
  const res = await api.post(`/api/v1/users/users/${userId}/restore`);
  return res.data;
}
