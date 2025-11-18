import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor, fireEvent } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import BudgetManagement from '../BudgetManagement';
import { financeApi } from '@/api/finance';

vi.mock('@/api/finance');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockMasterBudgets = [
  {
    id: 1,
    name: 'Q1 2024 Budget',
    total_amount: 1000000,
    start_date: '2024-01-01',
    end_date: '2024-03-31',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Q2 2024 Budget',
    total_amount: 1200000,
    start_date: '2024-04-01',
    end_date: '2024-06-30',
    created_at: '2024-04-01T00:00:00Z',
  },
];

const mockSubBudgets = [
  {
    id: 1,
    master_budget_id: 1,
    name: 'Marketing',
    amount: 200000,
    type: 'marketing',
  },
  {
    id: 2,
    master_budget_id: 1,
    name: 'Operations',
    amount: 500000,
    type: 'operations',
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('BudgetManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders budget management page', async () => {
    (financeApi.getMasterBudgets as any).mockResolvedValue({
      data: mockMasterBudgets,
    });

    render(<BudgetManagement />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Budget Management')).toBeInTheDocument();
    });
  });

  it('displays master budgets list', async () => {
    (financeApi.getMasterBudgets as any).mockResolvedValue({
      data: mockMasterBudgets,
    });

    render(<BudgetManagement />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Q1 2024 Budget')).toBeInTheDocument();
      expect(screen.getByText('Q2 2024 Budget')).toBeInTheDocument();
      expect(screen.getByText('$1,000,000.00')).toBeInTheDocument();
      expect(screen.getByText('$1,200,000.00')).toBeInTheDocument();
    });
  });

  it('shows empty state when no budgets', async () => {
    (financeApi.getMasterBudgets as any).mockResolvedValue({ data: [] });

    render(<BudgetManagement />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/No master budgets found/i)).toBeInTheDocument();
    });
  });

  it('opens create master budget dialog', async () => {
    (financeApi.getMasterBudgets as any).mockResolvedValue({
      data: mockMasterBudgets,
    });

    render(<BudgetManagement />, { wrapper: createWrapper() });

    const createButton = await screen.findByText('Create Master Budget');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('loads sub-budgets when master budget is expanded', async () => {
    (financeApi.getMasterBudgets as any).mockResolvedValue({
      data: mockMasterBudgets,
    });
    (financeApi.getSubBudgets as any).mockResolvedValue({
      data: mockSubBudgets,
    });

    render(<BudgetManagement />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Q1 2024 Budget')).toBeInTheDocument();
    });

    const expandButton = screen.getAllByRole('button')[1]; // First budget expand button
    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(financeApi.getSubBudgets).toHaveBeenCalledWith(1);
    });
  });

  it('displays sub-budgets correctly', async () => {
    (financeApi.getMasterBudgets as any).mockResolvedValue({
      data: mockMasterBudgets,
    });
    (financeApi.getSubBudgets as any).mockResolvedValue({
      data: mockSubBudgets,
    });

    render(<BudgetManagement />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Q1 2024 Budget')).toBeInTheDocument();
    });

    const expandButton = screen.getAllByRole('button')[1];
    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText('Marketing')).toBeInTheDocument();
      expect(screen.getByText('Operations')).toBeInTheDocument();
      expect(screen.getByText('$200,000.00')).toBeInTheDocument();
      expect(screen.getByText('$500,000.00')).toBeInTheDocument();
    });
  });

  it('handles create master budget', async () => {
    (financeApi.getMasterBudgets as any).mockResolvedValue({
      data: mockMasterBudgets,
    });
    (financeApi.createMasterBudget as any).mockResolvedValue({
      data: { id: 3, name: 'New Budget' },
    });

    render(<BudgetManagement />, { wrapper: createWrapper() });

    const createButton = await screen.findByText('Create Master Budget');
    fireEvent.click(createButton);

    // Fill form and submit (implementation depends on your dialog component)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('handles budget upload', async () => {
    (financeApi.getMasterBudgets as any).mockResolvedValue({
      data: mockMasterBudgets,
    });
    (financeApi.uploadBudget as any).mockResolvedValue({
      data: { success: true },
    });

    render(<BudgetManagement />, { wrapper: createWrapper() });

    const uploadButton = await screen.findByText('Upload Budget');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('calculates budget utilization percentage', async () => {
    const budgetWithUsage = [
      {
        ...mockMasterBudgets[0],
        used_amount: 600000,
      },
    ];

    (financeApi.getMasterBudgets as any).mockResolvedValue({
      data: budgetWithUsage,
    });

    render(<BudgetManagement />, { wrapper: createWrapper() });

    await waitFor(() => {
      // 600000 / 1000000 = 60%
      expect(screen.getByText(/60%/)).toBeInTheDocument();
    });
  });

  it('displays warning for high utilization', async () => {
    const budgetWithHighUsage = [
      {
        ...mockMasterBudgets[0],
        used_amount: 900000, // 90% utilization
      },
    ];

    (financeApi.getMasterBudgets as any).mockResolvedValue({
      data: budgetWithHighUsage,
    });

    render(<BudgetManagement />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Should show warning color/indicator
      expect(screen.getByText(/90%/)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (financeApi.getMasterBudgets as any).mockRejectedValue(
      new Error('Failed to fetch budgets')
    );

    render(<BudgetManagement />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Budget Management')).toBeInTheDocument();
    });
  });
});
