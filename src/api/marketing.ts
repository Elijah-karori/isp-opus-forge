import axios from "./axios";

export const postMarketing = (payload: any) =>
  axios.post("/marketing/posts", payload);

export const listMarketing = () =>
  axios.get("/marketing/posts");
