import axios from "./axios";

export const createTechnicianRequest = (payload: any) =>
  axios.post("/technician/requests", payload);

export const fetchMyTasks = () =>
  axios.get("/tasks/my");
