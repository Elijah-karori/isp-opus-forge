import axios from "./axios";

export const postMarketing = (payload: any) =>
  axios.post("/marketing/posts", payload);

export const listMarketing = () =>
  axios.get("/marketing/posts");

export async function getCampaigns() {
  const res = await axios.get("/marketing/campaigns");
  return res.data;
}

export async function approveCampaign(id: number, action: string, comment?: string) {
  return axios.post("/workflow/actions", {
    instance_id: id,
    action,
    comment,
  });
}
