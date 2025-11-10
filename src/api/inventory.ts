// src/api/inventory.ts
import axios from "./axios";

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
  out_of_stock_items: number;
}

// Search and basic operations
export const searchInventory = (q: string) =>
  axios.get("/inventory/search", { params: { q } });

export const getProducts = (params?: {
  skip?: number;
  limit?: number;
  category?: string;
  low_stock?: boolean;
  supplier_id?: number;
}) => axios.get("/inventory/products", { params });

export const getProduct = (productId: number) =>
  axios.get(`/inventory/products/${productId}`);

export const createProduct = (data: Partial<Product>) =>
  axios.post("/inventory/products", data);

export const updateProduct = (productId: number, data: Partial<Product>) =>
  axios.patch(`/inventory/products/${productId}`, data);

// Supplier operations
export const getSuppliers = (params?: { skip?: number; limit?: number; active_only?: boolean }) =>
  axios.get("/inventory/suppliers", { params });

export const createSupplier = (data: Partial<Supplier>) =>
  axios.post("/inventory/suppliers", data);

export const triggerSupplierScrape = (supplierId: number) =>
  axios.post(`/scrapers/suppliers/${supplierId}/scrape`);

// Price monitoring
export const getProductPriceHistory = (productId: number, limit: number = 100) =>
  axios.get(`/scrapers/price-history/${productId}`, { params: { limit } });

export const getRecentPriceDrops = (days: number = 7, min_drop_percent: number = 5.0) =>
  axios.get("/scrapers/price-drops", { params: { days, min_drop_percent } });

// Scraper operations
export const scrapeGenericUrl = (url: string, category: string = "Generic", supplierId: number = 0) =>
  axios.post("/scrapers/scrape-generic", { url, category, supplier_id: supplierId });

export const scrapeAllSuppliers = () =>
  axios.post("/scrapers/scrape-all");

// Inventory analytics
export const getInventoryStats = () =>
  axios.get("/inventory/stats");

export const getLowStockAlerts = () =>
  axios.get("/inventory/alerts/low-stock");

export const getPriceChangeAlerts = (days: number = 7) =>
  axios.get("/inventory/alerts/price-changes", { params: { days } });
