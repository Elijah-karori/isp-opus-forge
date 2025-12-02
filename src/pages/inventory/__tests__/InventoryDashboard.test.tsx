import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Inventory from '../../Inventory';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as inventoryApi from '@/api/inventory';

// Mock dependencies
const mockToast = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: mockToast,
    }),
}));

vi.mock('@/api/inventory', () => ({
    getInventoryStats: vi.fn(),
    getLowStockAlerts: vi.fn(),
    searchInventory: vi.fn(),
    scrapeAllSuppliers: vi.fn(),
    triggerSupplierScrape: vi.fn(),
    getProducts: vi.fn(),
    getSuppliers: vi.fn(),
}));

const mockProducts = [
    { id: 1, name: 'Router X1', sku: 'RT-X1', stock_quantity: 10, reorder_point: 5, unit_price: 100, supplier_id: 1, category: 'Hardware', unit: 'pcs' },
    { id: 2, name: 'Cable 5m', sku: 'CB-5M', stock_quantity: 2, reorder_point: 10, unit_price: 5, supplier_id: 1, category: 'Cables', unit: 'pcs' },
];

const mockSuppliers = [
    { id: 1, name: 'TechSupply Inc', is_active: true, contact_email: 'info@techsupply.com', contact_phone: '+254712345678' },
];

const createTestQueryClient = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: Infinity,
            },
        },
    });

    // Pre-populate cache with mock data
    queryClient.setQueryData(['products'], mockProducts);
    queryClient.setQueryData(['suppliers'], mockSuppliers);
    queryClient.setQueryData(['inventory-stats'], {});
    queryClient.setQueryData(['low-stock-alerts'], []);

    return queryClient;
};

describe('Inventory Dashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (inventoryApi.getInventoryStats as any).mockResolvedValue({});
        (inventoryApi.getLowStockAlerts as any).mockResolvedValue([]);
        (inventoryApi.searchInventory as any).mockResolvedValue([]);
        (inventoryApi.scrapeAllSuppliers as any).mockResolvedValue({});
    });

    it('renders inventory dashboard correctly', async () => {
        const queryClient = createTestQueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <Inventory />
            </QueryClientProvider>
        );

        expect(screen.getByText('Inventory Management')).toBeInTheDocument();
        expect(screen.getByText('Router X1')).toBeInTheDocument();
        expect(screen.getByText('Cable 5m')).toBeInTheDocument();
    });

    it('displays low stock warning', async () => {
        const queryClient = createTestQueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <Inventory />
            </QueryClientProvider>
        );

        // Cable 5m has stock 2, reorder 10 -> Low Stock
        // Use getAllByText because "Low Stock" appears as a header and a badge
        const lowStockElements = screen.getAllByText('Low Stock');
        expect(lowStockElements.length).toBeGreaterThan(0);
    });

    it('handles search functionality', async () => {
        const queryClient = createTestQueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <Inventory />
            </QueryClientProvider>
        );

        const searchInput = screen.getByPlaceholderText(/search products/i);
        fireEvent.change(searchInput, { target: { value: 'Router' } });

        const searchBtn = screen.getByRole('button', { name: /search/i });
        fireEvent.click(searchBtn);

        await waitFor(() => {
            expect(inventoryApi.searchInventory).toHaveBeenCalled();
        });
    });

    it('triggers scrape all suppliers', async () => {
        const queryClient = createTestQueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <Inventory />
            </QueryClientProvider>
        );

        const updateBtns = screen.getAllByRole('button', { name: /update prices/i });
        fireEvent.click(updateBtns[0]);

        await waitFor(() => {
            expect(inventoryApi.scrapeAllSuppliers).toHaveBeenCalled();
            expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
                title: "Success"
            }));
        });
    });
});
