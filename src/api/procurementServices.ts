/**
 * Procurement & Inventory Services API Client
 * Advanced procurement operations with price comparison and smart ordering
 */

import { apiClient } from '@/lib/api';
import type {
    ProductSearchResult,
    PriceComparisonRequest,
    PriceComparisonResponse,
    SmartPurchaseOrderRequest,
    PurchaseOrderResponse,
    BulkProcurementRequest,
    SpendingTrendsResponse,
    InventoryReorderPrediction,
    StockOptimizationResponse,
    InventoryTurnoverResponse,
    DeadStockItem,
    AutoReorderRequest,
    SuccessResponse,
} from '@/types/api.types';

const axios = apiClient.axios;

// =====================================================================
// PRODUCT SEARCH & COMPARISON
// =====================================================================

export interface ProductSearchParams {
    q: string;
    use_scrapers?: boolean;
    max_results?: number;
}

/**
 * Search for products across all suppliers
 * Set use_scrapers=true for real-time scraping
 */
export const searchProducts = async (
    params: ProductSearchParams
): Promise<ProductSearchResult[]> => {
    const response = await axios.get<ProductSearchResult[]>('/products/search', {
        params,
    });
    return response.data;
};

/**
 * Compare prices for a product across suppliers
 */
export const compareProductPrices = async (
    request: PriceComparisonRequest
): Promise<PriceComparisonResponse> => {
    const response = await axios.post<PriceComparisonResponse>(
        '/products/compare-prices',
        request
    );
    return response.data;
};

/**
 * Find best supplier for a product based on price, stock, and rating
 */
export const findBestSupplier = async (productId: number, quantity: number = 1) => {
    const response = await axios.get(`/products/${productId}/best-supplier`, {
        params: { quantity },
    });
    return response.data;
};

/**
 * Find similar/alternative products
 */
export const getProductAlternatives = async (
    productId: number,
    maxResults: number = 10
) => {
    const response = await axios.get(`/products/${productId}/alternatives`, {
        params: { max_results: maxResults },
    });
    return response.data;
};

/**
 * Check real-time product availability
 */
export const checkProductAvailability = async (
    productId: number,
    useScraper: boolean = false
) => {
    const response = await axios.get(`/products/${productId}/availability`, {
        params: { use_scraper: useScraper },
    });
    return response.data;
};

// =====================================================================
// SMART PROCUREMENT
// =====================================================================

/**
 * Create smart purchase order with automated supplier selection
 * Automatically selects best supplier based on price and availability
 */
export const createSmartPurchaseOrder = async (
    request: SmartPurchaseOrderRequest
): Promise<PurchaseOrderResponse> => {
    const response = await axios.post<PurchaseOrderResponse>(
        '/procurement/smart-order',
        request
    );
    return response.data;
};

/**
 * Create optimized bulk purchase orders
 * Groups items by supplier to minimize costs
 */
export const createBulkProcurement = async (
    request: BulkProcurementRequest
): Promise<PurchaseOrderResponse[]> => {
    const response = await axios.post<PurchaseOrderResponse[]>(
        '/procurement/bulk-order',
        request
    );
    return response.data;
};

/**
 * Get price history for a product
 */
export const getPriceHistory = async (productId: number, days: number = 90) => {
    const response = await axios.get(`/procurement/price-history/${productId}`, {
        params: { days },
    });
    return response.data;
};

/**
 * Suggest alternative suppliers for a product
 */
export const getAlternativeSuppliers = async (
    productId: number,
    currentSupplierId: number
) => {
    const response = await axios.get(
        `/procurement/alternative-suppliers/${productId}`,
        {
            params: { current_supplier_id: currentSupplierId },
        }
    );
    return response.data;
};

/**
 * Calculate total procurement cost including shipping and taxes
 */
export const calculateTotalCost = async (
    supplierId: number,
    items: Array<{ product_id: number; quantity: number }>,
    includeShipping: boolean = true,
    includeTax: boolean = true
) => {
    const response = await axios.post(
        '/procurement/calculate-cost',
        items,
        {
            params: {
                supplier_id: supplierId,
                include_shipping: includeShipping,
                include_tax: includeTax,
            },
        }
    );
    return response.data;
};

/**
 * Analyze procurement spending trends
 */
export const analyzeSpendingTrends = async (
    days: number = 90,
    groupBy: string = 'supplier'
): Promise<SpendingTrendsResponse> => {
    const response = await axios.get<SpendingTrendsResponse>(
        '/procurement/spending-trends',
        {
            params: { days, group_by: groupBy },
        }
    );
    return response.data;
};

// =====================================================================
// PROCUREMENT SERVICES API OBJECT
// =====================================================================

export const procurementServicesApi = {
    searchProducts,
    compareProductPrices,
    findBestSupplier,
    getProductAlternatives,
    checkProductAvailability,
    createSmartPurchaseOrder,
    createBulkProcurement,
    getPriceHistory,
    getAlternativeSuppliers,
    calculateTotalCost,
    analyzeSpendingTrends,
};

// =====================================================================
// INVENTORY ANALYTICS & OPTIMIZATION
// =====================================================================

/**
 * Get products below reorder level with recommendations
 */
export const getLowStockProducts = async (thresholdMultiplier: number = 1.0) => {
    const response = await axios.get('/inventory/low-stock', {
        params: { threshold_multiplier: thresholdMultiplier },
    });
    return response.data;
};

/**
 * Get reorder predictions for all products
 */
export const getReorderPredictions = async (): Promise<
    InventoryReorderPrediction[]
> => {
    const response = await axios.get<InventoryReorderPrediction[]>(
        '/inventory/reorder-predictions'
    );
    return response.data;
};

/**
 * Predict when a product will need reordering
 */
export const predictReorderDate = async (
    productId: number
): Promise<InventoryReorderPrediction> => {
    const response = await axios.get<InventoryReorderPrediction>(
        `/inventory/${productId}/reorder-prediction`
    );
    return response.data;
};

/**
 * Calculate optimal stock levels for a product
 */
export const optimizeStockLevels = async (
    productId: number,
    targetServiceLevel: number = 0.95
): Promise<StockOptimizationResponse> => {
    const response = await axios.get<StockOptimizationResponse>(
        `/inventory/${productId}/optimize-levels`,
        {
            params: { target_service_level: targetServiceLevel },
        }
    );
    return response.data;
};

/**
 * Calculate inventory turnover metrics
 */
export const getInventoryTurnover = async (
    days: number = 90
): Promise<InventoryTurnoverResponse[]> => {
    const response = await axios.get<InventoryTurnoverResponse[]>(
        '/inventory/turnover-analysis',
        {
            params: { days },
        }
    );
    return response.data;
};

/**
 * Identify slow-moving or dead stock
 */
export const identifyDeadStock = async (
    daysThreshold: number = 90
): Promise<DeadStockItem[]> => {
    const response = await axios.get<DeadStockItem[]>('/inventory/dead-stock', {
        params: { days_threshold: daysThreshold },
    });
    return response.data;
};

/**
 * Automatically reorder product after checking current market prices
 * Only creates PO if price is within acceptable threshold
 */
export const autoReorderProduct = async (
    request: AutoReorderRequest
): Promise<SuccessResponse> => {
    const response = await axios.post<SuccessResponse>(
        `/inventory/${request.product_id}/auto-reorder`,
        request
    );
    return response.data;
};

/**
 * Get total inventory value and breakdown
 */
export const getInventoryValuation = async () => {
    const response = await axios.get('/inventory/valuation');
    return response.data;
};

// =====================================================================
// INVENTORY SERVICES API OBJECT
// =====================================================================

export const inventoryServicesApi = {
    getLowStockProducts,
    getReorderPredictions,
    predictReorderDate,
    optimizeStockLevels,
    getInventoryTurnover,
    identifyDeadStock,
    autoReorderProduct,
    getInventoryValuation,
};
