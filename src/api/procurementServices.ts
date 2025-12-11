/**
 * Procurement & Inventory Services API Client
 */

import { apiClient } from '@/lib/api';

const axios = apiClient.axios;

// Types
export interface ProductSearchParams {
    q: string;
    use_scrapers?: boolean;
    max_results?: number;
}

export interface PriceComparisonRequest {
    product_name: string;
    quantity?: number;
    min_stock?: number;
}

export interface SmartPurchaseOrderRequest {
    product_id: number;
    quantity: number;
    requester_id: number;
    prefer_supplier_id?: number;
}

export interface BulkProcurementRequest {
    items: Array<{ product_id: number; quantity: number; }>;
    requester_id: number;
    optimize_by_supplier?: boolean;
}

export interface AutoReorderRequest {
    product_id: number;
    requester_id: number;
    price_threshold_percent?: number;
}

// API Functions
export const procurementServicesApi = {
    searchProducts: async (params: ProductSearchParams) => {
        const response = await axios.get('/search', { params });
        return response.data;
    },
    compareProductPrices: async (request: PriceComparisonRequest) => {
        const response = await axios.post('/compare-prices', request);
        return response.data;
    },
    findBestSupplier: async (productId: number, quantity: number = 1) => {
        const response = await axios.get(`/${productId}/best-supplier`, { params: { quantity } });
        return response.data;
    },
    getProductAlternatives: async (productId: number, maxResults: number = 10) => {
        const response = await axios.get(`/${productId}/alternatives`, { params: { max_results: maxResults } });
        return response.data;
    },
    checkProductAvailability: async (productId: number, useScraper: boolean = false) => {
        const response = await axios.get(`/${productId}/availability`, { params: { use_scraper: useScraper } });
        return response.data;
    },
    createSmartPurchaseOrder: async (request: SmartPurchaseOrderRequest) => {
        const response = await axios.post('/smart-order', request);
        return response.data;
    },
    createBulkProcurement: async (request: BulkProcurementRequest) => {
        const response = await axios.post('/bulk-order', request);
        return response.data;
    },
    getPriceHistory: async (productId: number, days: number = 90) => {
        const response = await axios.get(`/price-history/${productId}`, { params: { days } });
        return response.data;
    },
    getAlternativeSuppliers: async (productId: number, currentSupplierId: number) => {
        const response = await axios.get(`/alternative-suppliers/${productId}`, { params: { current_supplier_id: currentSupplierId } });
        return response.data;
    },
    calculateTotalCost: async (supplierId: number, items: any[], includeShipping: boolean = true, includeTax: boolean = true) => {
        const response = await axios.post('/calculate-cost', { items, supplier_id: supplierId, include_shipping: includeShipping, include_tax: includeTax });
        return response.data;
    },
    analyzeSpendingTrends: async (days: number = 90, groupBy: string = 'supplier') => {
        const response = await axios.get('/spending-trends', { params: { days, group_by: groupBy } });
        return response.data;
    },
};

export const inventoryServicesApi = {
    getLowStockProducts: async (thresholdMultiplier: number = 1.0) => {
        const response = await axios.get('/low-stock', { params: { threshold_multiplier: thresholdMultiplier } });
        return response.data;
    },
    getReorderPredictions: async () => {
        const response = await axios.get('/reorder-predictions');
        return response.data;
    },
    predictReorderDate: async (productId: number) => {
        const response = await axios.get(`/${productId}/reorder-prediction`);
        return response.data;
    },
    optimizeStockLevels: async (productId: number, targetServiceLevel: number = 0.95) => {
        const response = await axios.get(`/${productId}/optimize-levels`, { params: { target_service_level: targetServiceLevel } });
        return response.data;
    },
    getInventoryTurnover: async (days: number = 90) => {
        const response = await axios.get('/turnover-analysis', { params: { days } });
        return response.data;
    },
    identifyDeadStock: async (daysThreshold: number = 90) => {
        const response = await axios.get('/dead-stock', { params: { days_threshold: daysThreshold } });
        return response.data;
    },
    autoReorderProduct: async (request: AutoReorderRequest) => {
        const response = await axios.post(`/${request.product_id}/auto-reorder`, request);
        return response.data;
    },
    getInventoryValuation: async () => {
        const response = await axios.get('/valuation');
        return response.data;
    },
};
