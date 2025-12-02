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
      // Use getAllByText since the amount might appear in summary and list
      const amounts = screen.getAllByText((content, element) => {
        return element?.textContent === '$1,000,000' || element?.textContent?.includes('1,000,000');
      });
      expect(amounts.length).toBeGreaterThan(0);
    });
  });

  it('shows empty state when no budgets', async () => {
    (financeApi.getMasterBudgets as any).mockResolvedValue({ data: [] });

    render(<BudgetManagement />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/No Budgets Yet/i)).toBeInTheDocument();
    });
  });

  it('opens create master budget dialog', async () => {
    (financeApi.getMasterBudgets as any).mockResolvedValue({
      data: mockMasterBudgets,
    });

    render(<BudgetManagement />, { wrapper: createWrapper() });

    // There are two "Create Master Budget" buttons (one in header, one in empty state if empty, but here we have data)
    // Actually, in the header there is one.
    const createButton = await screen.findByRole('button', { name: /Create Master Budget/i });
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

    const expandButton = screen.getAllByLabelText('Expand budget')[0];
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
    // Mock getBudgetUsages to return empty array for sub-budgets to avoid errors
    (financeApi.getBudgetUsages as any).mockResolvedValue({ data: [] });

    render(<BudgetManagement />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Q1 2024 Budget')).toBeInTheDocument();
    });

    const expandButton = screen.getAllByLabelText('Expand budget')[0];
    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText('Marketing')).toBeInTheDocument();
      expect(screen.getByText('Operations')).toBeInTheDocument();
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

    const createButton = await screen.findByRole('button', { name: /Create Master Budget/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('handles budget upload', async () => {
    (financeApi.getMasterBudgets as any).mockResolvedValue({
      data: mockMasterBudgets,
    });

    render(<BudgetManagement />, { wrapper: createWrapper() });

    const uploadButton = await screen.findByRole('button', { name: /Upload Excel/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('calculates budget utilization percentage', async () => {
    // This test logic relies on SubBudgetCard rendering.
    // We need to mock sub-budgets and usages.
    const mockSub = { ...mockSubBudgets[0], amount: '100000' };
    const mockUsage = [{ id: 1, amount: '60000', type: 'debit', status: 'approved' }];

    (financeApi.getMasterBudgets as any).mockResolvedValue({
      data: mockMasterBudgets,
    });
    (financeApi.getSubBudgets as any).mockResolvedValue({
      data: [mockSub],
    });
    (financeApi.getBudgetUsages as any).mockResolvedValue({
      data: mockUsage,
    });

    render(<BudgetManagement />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Q1 2024 Budget')).toBeInTheDocument();
    });

    const expandButton = screen.getAllByLabelText('Expand budget')[0];
    fireEvent.click(expandButton);

    await waitFor(() => {
      // 60000 / 100000 = 60%
      expect(screen.getByText(/60.0%/)).toBeInTheDocument();
    });
  });

  it('displays warning for high utilization', async () => {
    const mockSub = { ...mockSubBudgets[0], amount: '100000' };
    const mockUsage = [{ id: 1, amount: '110000', type: 'debit', status: 'approved' }]; // 110%

    (financeApi.getMasterBudgets as any).mockResolvedValue({
      data: mockMasterBudgets,
    });
    (financeApi.getSubBudgets as any).mockResolvedValue({
      data: [mockSub],
    });
    (financeApi.getBudgetUsages as any).mockResolvedValue({
      data: mockUsage,
    });

    render(<BudgetManagement />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Q1 2024 Budget')).toBeInTheDocument();
    });

    const expandButton = screen.getAllByLabelText('Expand budget')[0];
    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText(/110.0%/)).toBeInTheDocument();
      expect(screen.getByText(/Over budget/i)).toBeInTheDocument();
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
