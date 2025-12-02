import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Invoices from '../../Invoices';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { invoicesApi } from '@/api/invoices';

// Mock dependencies
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('@/api/invoices', () => ({
    invoicesApi: {
        getOverdueInvoices: vi.fn(),
    },
}));

// Mock PermissionGate to always render children
vi.mock('@/components/PermissionGate', () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

describe('Invoices Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (invoicesApi.getOverdueInvoices as any).mockResolvedValue([]);
    });

    it('renders invoices list correctly', async () => {
        const queryClient = createTestQueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <Invoices />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(screen.getByText('Invoices')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
            expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
        });
    });

    it('filters invoices by status', async () => {
        const queryClient = createTestQueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <Invoices />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Wait for all invoices to render initially
        await waitFor(() => {
            expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
            expect(screen.getByText('INV-2024-002')).toBeInTheDocument();
            expect(screen.getByText('INV-2024-003')).toBeInTheDocument();
            expect(screen.getByText('INV-2024-004')).toBeInTheDocument();
        });

        // Find and click the Pending filter button
        const buttons = screen.getAllByRole('button');
        const pendingButton = buttons.find(button => button.textContent === 'Pending');

        expect(pendingButton).toBeDefined();
        fireEvent.click(pendingButton!);

        // After clicking, only pending invoice should be visible
        // INV-2024-003 has amount_paid='0.00' and due_date in future, so it's pending
        await waitFor(() => {
            expect(screen.getByText('INV-2024-003')).toBeInTheDocument();
        }, { timeout: 1000 });

        // Paid invoice should not be visible
        expect(screen.queryByText('INV-2024-001')).not.toBeInTheDocument();
    });

    it('navigates to create invoice page', async () => {
        const queryClient = createTestQueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <Invoices />
                </MemoryRouter>
            </QueryClientProvider>
        );

        const createBtn = screen.getByRole('button', { name: /create invoice/i });
        fireEvent.click(createBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/invoices/create');
    });
});
