// src/api/procurement.ts
import api from "./axios";

export async function getPurchaseOrders() {
  const res = await api.get("/api/v1/procurement/orders/pending");
  return res.data;
}
