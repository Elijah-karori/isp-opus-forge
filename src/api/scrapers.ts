import api from "./axios";

export async function getPriceHistory(productId: number) {
  const res = await api.get(`/api/v1/scrapers/price-history/${productId}`);
  return res.data;
}

export async function getRecentPriceDrops() {
  const res = await api.get("/api/v1/scrapers/price-drops");
  return res.data;
}

export async function triggerScraper(supplierId: number) {
  const res = await api.post(`/api/v1/scrapers/suppliers/${supplierId}/scrape`);
  return res.data;
}

export async function scrapeAllSuppliers() {
  const res = await api.post("/api/v1/scrapers/scrape-all");
  return res.data;
}

export async function scrapeGenericUrl(url: string) {
  const res = await api.post("/api/v1/scrapers/scrape-generic", { url });
  return res.data;
}
