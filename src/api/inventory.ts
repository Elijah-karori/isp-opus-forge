import axios from "./axios";

export const searchInventory = (q: string) =>
  axios.get("/inventory/search", { params: { q } });

export const triggerSupplierScrape = (supplierId: number) =>
  axios.post(`/suppliers/${supplierId}/scrape`);

export const getProductPriceHistory = (productId: number) =>
  axios.get(`/products/${productId}/price-history`);

export const getSuppliers = () =>
  axios.get("/suppliers");
