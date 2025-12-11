// src/api/inventory.ts
import { apiClient } from '@/lib/api';

const axios = apiClient.axios;

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  description?: string;
  unit_price: number;
  stock_quantity: number;
  reorder_point: number;
  unit: string;
  supplier_id: number;
  is_active: boolean;
  created_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface PriceHistory {
  id: number;
  product_id: number;
  old_price: number;
  new_price: number;
  price_change: number;
  price_change_percent: number;
  recorded_at: string;
}

export interface InventoryStats {
  total_products: number;
  low_stock_items: number;
  total_inventory_value: number;
  total_value?: number;
  out_of_stock_items: number;
}

// Search and basic operations - returns data directly
export const searchInventory = async (q: string) => {
  const response = await axios.get("/inventory/search", { params: { q } });
  return response.data;
};

export const getProducts = async (params?: {
  skip?: number;
  limit?: number;
  category?: string;
  low_stock?: boolean;
  supplier_id?: number;
}) => {
  const response = await axios.get("/inventory/products", { params });
  return response.data;
};

export const getProduct = async (productId: number) => {
  const response = await axios.get(`/inventory/products/${productId}`);
  return response.data;
};

export const createProduct = async (data: Partial<Product>) => {
  const response = await axios.post("/inventory/products", data);
  return response.data;
};

export const updateProduct = async (productId: number, data: Partial<Product>) => {
  const response = await axios.patch(`/inventory/products/${productId}`, data);
  return response.data;
};

// Supplier operations
export const getSuppliers = async (params?: { skip?: number; limit?: number; active_only?: boolean }) => {
  const response = await axios.get("/inventory/suppliers", { params });
  return response.data;
};

export const createSupplier = async (data: Partial<Supplier>) => {
  const response = await axios.post("/inventory/suppliers", data);
  return response.data;
};

export const triggerSupplierScrape = async (supplierId: number) => {
  const response = await axios.post(`/scrapers/suppliers/${supplierId}/scrape`);
  return response.data;
};

// Price monitoring
export const getProductPriceHistory = async (productId: number, limit: number = 100) => {
  const response = await axios.get(`/scrapers/price-history/${productId}`, { params: { limit } });
  return response.data;
};

export const getRecentPriceDrops = async (days: number = 7, min_drop_percent: number = 5.0) => {
  const response = await axios.get("/scrapers/price-drops", { params: { days, min_drop_percent } });
  return response.data;
};

// Scraper operations
export const scrapeGenericUrl = async (url: string, category: string = "Generic", supplierId: number = 0) => {
  const response = await axios.post("/scrapers/scrape-generic", { url, category, supplier_id: supplierId });
  return response.data;
};

export const scrapeAllSuppliers = async () => {
  const response = await axios.post("/scrapers/scrape-all");
  return response.data;
};

// Inventory analytics
export const getInventoryStats = async (): Promise<InventoryStats> => {
  const response = await axios.get("/inventory/stats");
  return response.data;
};

export const getLowStockAlerts = async () => {
  const response = await axios.get("/inventory/alerts/low-stock");
  return response.data;
};

export const getPriceChangeAlerts = async (days: number = 7) => {
  const response = await axios.get("/inventory/alerts/price-changes", { params: { days } });
  return response.data;
};

// API object for easier use
export const inventoryApi = {
  searchInventory,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  getSuppliers,
  createSupplier,
  triggerSupplierScrape,
  getProductPriceHistory,
  getRecentPriceDrops,
  scrapeGenericUrl,
  scrapeAllSuppliers,
  getInventoryStats,
  getLowStockAlerts,
  getPriceChangeAlerts,
};