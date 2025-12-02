/**
 * Procurement & Inventory Services API Client
 * Advanced product search, procurement optimization, and inventory analytics
 */

import apiClient from './axios';

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
    items: Array<{
        product_id: number;
        quantity: number;
    }>;
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
    // Product Search & Comparison
    searchProducts: (params: ProductSearchParams) =>
        apiClient.get('/api/v1search', { params }),

    compareProductPrices: (request: PriceComparisonRequest) =>
        apiClient.post('/api/v1compare-prices', request),

    findBestSupplier: (productId: number, quantity: number = 1) =>
        apiClient.get(`/api/v1${productId}/best-supplier`, {
            params: { quantity },
        }),

    getProductAlternatives: (productId: number, maxResults: number = 10) =>
        apiClient.get(`/api/v1${productId}/alternatives`, {
            params: { max_results: maxResults },
        }),

    checkProductAvailability: (productId: number, useScraper: boolean = false) =>
        apiClient.get(`/api/v1${productId}/availability`, {
            params: { use_scraper: useScraper },
        }),

    // Procurement Operations
    createSmartPurchaseOrder: (request: SmartPurchaseOrderRequest) =>
        apiClient.post('/api/v1smart-order', request),

    createBulkProcurement: (request: BulkProcurementRequest) =>
        apiClient.post('/api/v1bulk-order', request),

    getPriceHistory: (productId: number, days: number = 90) =>
        apiClient.get(`/api/v1price-history/${productId}`, {
            params: { days },
        }),

    getAlternativeSuppliers: (productId: number, currentSupplierId: number) =>
        apiClient.get(`/api/v1alternative-suppliers/${productId}`, {
            params: { current_supplier_id: currentSupplierId },
        }),

    calculateTotalCost: (
        supplierId: number,
        items: any[],
        includeShipping: boolean = true,
        includeTax: boolean = true
    ) =>
        apiClient.post('/api/v1calculate-cost', items, {
            params: {
                supplier_id: supplierId,
                include_shipping: includeShipping,
                include_tax: includeTax,
            },
        }),

    analyzeSpendingTrends: (days: number = 90, groupBy: string = 'supplier') =>
        apiClient.get('/api/v1spending-trends', {
            params: { days, group_by: groupBy },
        }),
};

export const inventoryServicesApi = {
    // Inventory Analytics
    getLowStockProducts: (thresholdMultiplier: number = 1.0) =>
        apiClient.get('/api/v1low-stock', {
            params: { threshold_multiplier: thresholdMultiplier },
        }),

    getReorderPredictions: () =>
        apiClient.get('/api/v1reorder-predictions'),

    predictReorderDate: (productId: number) =>
        apiClient.get(`/api/v1${productId}/reorder-prediction`),

    optimizeStockLevels: (productId: number, targetServiceLevel: number = 0.95) =>
        apiClient.get(`/api/v1${productId}/optimize-levels`, {
            params: { target_service_level: targetServiceLevel },
        }),

    getInventoryTurnover: (days: number = 90) =>
        apiClient.get('/api/v1turnover-analysis', {
            params: { days },
        }),

    identifyDeadStock: (daysThreshold: number = 90) =>
        apiClient.get('/api/v1dead-stock', {
            params: { days_threshold: daysThreshold },
        }),

    autoReorderProduct: (request: AutoReorderRequest) =>
        apiClient.post(`/api/v1${request.product_id}/auto-reorder`, request),

    getInventoryValuation: () =>
        apiClient.get('/api/v1valuation'),
};
