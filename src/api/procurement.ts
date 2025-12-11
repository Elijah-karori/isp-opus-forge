// src/api/procurement.ts
import { apiClient } from '@/lib/api';

const axios = apiClient.axios;

export interface Supplier {
  id: number;
  name: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  scraper_class?: string;
  is_active: boolean;
  created_at: string;
  last_scraped?: string;
  product_count?: number;
}

export interface PurchaseOrder {
  id: number;
  supplier_id: number;
  order_number: string;
  status: 'draft' | 'submitted' | 'approved' | 'ordered' | 'received' | 'cancelled';
  total_amount: number;
  order_date: string;
  expected_delivery?: string;
  created_by: number;
  notes?: string;
  items: PurchaseOrderItem[];
  supplier?: Supplier;
  created_by_user?: {
    full_name: string;
    email: string;
  };
}

export interface PurchaseOrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: {
    name: string;
    sku: string;
    category: string;
  };
}

export interface ScrapedProduct {
  name: string;
  price: number;
  sku?: string;
  category?: string;
  description?: string;
  url?: string;
  image_url?: string;
  in_stock?: boolean;
  supplier_name?: string;
}

export interface ScraperRun {
  id: number;
  supplier_id: number;
  status: string;
  products_scraped: number;
  products_updated: number;
  products_added: number;
  error_message?: string;
  execution_time?: number;
  started_at: string;
  completed_at?: string;
}

// Supplier management
export const getSuppliers = (params?: { 
  skip?: number; 
  limit?: number; 
  active_only?: boolean;
}) => axios.get("/inventory/suppliers", { params });

export const createSupplier = (data: Partial<Supplier>) =>
  axios.post("/inventory/suppliers", data);

export const updateSupplier = (supplierId: number, data: Partial<Supplier>) =>
  axios.patch(`/inventory/suppliers/${supplierId}`, data);

// Purchase order management
export const getPurchaseOrders = (params?: {
  status?: string;
  supplier_id?: number;
  limit?: number;
  skip?: number;
}) => axios.get("/procurement/purchases", { params });

export const getPurchaseOrder = (orderId: number) =>
  axios.get(`/procurement/purchases/${orderId}`);

export const createPurchaseOrder = (data: Partial<PurchaseOrder>) =>
  axios.post("/procurement/purchases", data);

export const updatePurchaseOrder = (orderId: number, data: Partial<PurchaseOrder>) =>
  axios.patch(`/procurement/purchases/${orderId}`, data);

export const approvePurchaseOrder = (orderId: number, data: { 
  approved: boolean; 
  notes?: string;
}) => axios.post(`/procurement/purchases/${orderId}/approve`, data);

// Scraper operations
export const triggerSupplierScrape = (supplierId: number) =>
  axios.post(`/scrapers/suppliers/${supplierId}/scrape`);

export const scrapeGenericUrl = (url: string, category: string = "Generic", supplierId: number = 0) =>
  axios.post("/scrapers/scrape-generic", { url, category, supplier_id: supplierId });

export const scrapeAllSuppliers = () =>
  axios.post("/scrapers/scrape-all");

export const getPriceHistory = (productId: number, limit: number = 100) =>
  axios.get(`/scrapers/price-history/${productId}`, { params: { limit } });

export const getRecentPriceDrops = (days: number = 7, min_drop_percent: number = 5.0) =>
  axios.get("/scrapers/price-drops", { params: { days, min_drop_percent } });

// Procurement analytics
export const getProcurementStats = () =>
  axios.get("/procurement/stats");

export const getSupplierPerformance = (supplierId?: number) =>
  axios.get("/procurement/supplier-performance", { params: { supplier_id: supplierId } });

// Price comparison
export const comparePrices = (productName: string, category?: string) =>
  axios.get("/procurement/price-comparison", { params: { product_name: productName, category } });
