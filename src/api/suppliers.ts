import { apiClient } from '@/lib/api';

const api = apiClient.axios;

export async function getSuppliers() {
  const res = await api.get("/api/v1/inventory/suppliers");
  return res.data;
}

export async function createSupplier(supplierData: any) {
  const res = await api.post("/api/v1/inventory/suppliers", supplierData);
  return res.data;
}
