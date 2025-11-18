import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor, fireEvent } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import WorkflowDashboard from '../WorkflowDashboard';
import { workflowsApi } from '@/api/workflows';
import { useAuth } from '@/contexts/AuthContext';

// Mock modules
vi.mock('@/api/workflows');
vi.mock('@/contexts/AuthContext');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUser = {
  id: 1,
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'finance',
};

const mockPendingItems = [
  {
    id: 1,
    related_model: 'BudgetUsage',
    related_id: 101,
    status: 'pending',
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    related_model: 'Invoice',
    related_id: 202,
    status: 'pending',
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
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

describe('WorkflowDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
  });

  it('renders dashboard with stats', async () => {
    (workflowsApi.listPending as any).mockResolvedValue({
      data: mockPendingItems,
    });

    render(<WorkflowDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Workflow Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Count of pending items
    });
  });

  it('displays empty state when no pending items', async () => {
    (workflowsApi.listPending as any).mockResolvedValue({ data: [] });

    render(<WorkflowDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('No pending approvals')).toBeInTheDocument();
    });
  });

  it('groups items by resource type', async () => {
    (workflowsApi.listPending as any).mockResolvedValue({
      data: mockPendingItems,
    });

    render(<WorkflowDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/BudgetUsage:/)).toBeInTheDocument();
      expect(screen.getByText(/Invoice:/)).toBeInTheDocument();
    });
  });

  it('handles approve action', async () => {
    (workflowsApi.listPending as any).mockResolvedValue({
      data: mockPendingItems,
    });
    (workflowsApi.approveInstance as any).mockResolvedValue({ data: { success: true } });

    render(<WorkflowDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      const approveButtons = screen.getAllByText('Approve');
      expect(approveButtons.length).toBeGreaterThan(0);
    });

    const approveButtons = screen.getAllByText('Approve');
    fireEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(workflowsApi.approveInstance).toHaveBeenCalledWith(1);
    });
  });

  it('handles reject action', async () => {
    (workflowsApi.listPending as any).mockResolvedValue({
      data: mockPendingItems,
    });
    (workflowsApi.rejectInstance as any).mockResolvedValue({ data: { success: true } });

    render(<WorkflowDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      const rejectButtons = screen.getAllByText('Reject');
      expect(rejectButtons.length).toBeGreaterThan(0);
    });

    const rejectButtons = screen.getAllByText('Reject');
    fireEvent.click(rejectButtons[0]);

    await waitFor(() => {
      expect(workflowsApi.rejectInstance).toHaveBeenCalledWith(1);
    });
  });

  it('displays time since update correctly', async () => {
    (workflowsApi.listPending as any).mockResolvedValue({
      data: mockPendingItems,
    });

    render(<WorkflowDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Just now')).toBeInTheDocument();
      expect(screen.getByText('2h ago')).toBeInTheDocument();
    });
  });

  it('opens workflow overlay on details click', async () => {
    (workflowsApi.listPending as any).mockResolvedValue({
      data: mockPendingItems,
    });

    render(<WorkflowDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      const detailsButtons = screen.getAllByText('Details');
      expect(detailsButtons.length).toBeGreaterThan(0);
    });

    const detailsButtons = screen.getAllByText('Details');
    fireEvent.click(detailsButtons[0]);

    // Overlay should be opened (you'd need to verify this based on your implementation)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (workflowsApi.listPending as any).mockRejectedValue(
      new Error('Network error')
    );

    render(<WorkflowDashboard />, { wrapper: createWrapper() });

    // Component should still render without crashing
    await waitFor(() => {
      expect(screen.getByText('Workflow Dashboard')).toBeInTheDocument();
    });
  });

  it('filters by user role', async () => {
    const financeSpy = vi.fn().mockResolvedValue({ data: mockPendingItems });
    (workflowsApi.listPending as any) = financeSpy;

    render(<WorkflowDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(financeSpy).toHaveBeenCalledWith('finance');
    });
  });
});
