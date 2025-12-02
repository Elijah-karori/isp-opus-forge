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

        await waitFor(() => {
            expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
        });

        const pendingFilter = screen.getByRole('button', { name: /pending/i });
        fireEvent.click(pendingFilter);

        await waitFor(() => {
            expect(screen.getByText('INV-2024-003')).toBeInTheDocument();
            expect(screen.queryByText('INV-2024-001')).not.toBeInTheDocument();
        }, { timeout: 2000 });
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
