import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

// Mock recharts to avoid sizing issues in jsdom
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: any }) => (
      <div style={{ width: 800, height: 800 }}>{children}</div>
    ),
    BarChart: ({ children }: { children: any }) => <div>{children}</div>,
    Bar: () => <div>Bar</div>,
    XAxis: () => <div>XAxis</div>,
    YAxis: () => <div>YAxis</div>,
    CartesianGrid: () => <div>CartesianGrid</div>,
    Tooltip: () => <div>Tooltip</div>,
    Legend: () => <div>Legend</div>,
    PieChart: ({ children }: { children: any }) => <div>{children}</div>,
    Pie: ({ children }: { children: any }) => <div>{children}</div>,
    Cell: () => <div>Cell</div>,
  };
});

// Mock WorkflowOverlay
vi.mock('@/components/WorkflowOverlay', () => ({
  WorkflowOverlay: ({ onClose }: { onClose: () => void }) => (
    <div role="dialog">
      Mock Workflow Overlay
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const mockUser = {
  id: 1,
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'finance',
};

const mockStats = {
  pending_approvals: 2,
  sla_breaches: 0,
  approved_this_month: 5,
  by_resource_type: { BudgetUsage: 1, Invoice: 1 },
  approval_times: [{ name: 'Finance', hours: 24 }],
  bottlenecks: [{ name: 'Budget Approval', count: 15 }],
  completion_rates: [{ name: 'Approved', value: 65 }],
};

const mockPendingItems = [
  {
    id: 1,
    related_model: 'BudgetUsage',
    related_id: 101,
    status: 'pending',
    updated_at: '2023-01-01T12:00:00Z', // Fixed date
  },
  {
    id: 2,
    related_model: 'Invoice',
    related_id: 202,
    status: 'pending',
    updated_at: '2023-01-01T10:00:00Z', // 2 hours before
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

    // Mock getStats
    (workflowsApi.getStats as any).mockResolvedValue({ data: mockStats });

    // Setup fake timers - only mock Date to avoid breaking waitFor
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2023-01-01T12:05:00Z')); // 5 mins after first item
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders dashboard with stats', async () => {
    (workflowsApi.listPending as any).mockResolvedValue({
      data: mockPendingItems,
    });

    render(<WorkflowDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Workflow Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
      // We expect '2' from the pending items list length, not necessarily the stats API if the component calculates it from list
      // The component calculates pending_approvals from pendingItems.length
      expect(screen.getByText('2')).toBeInTheDocument();
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

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Mock Workflow Overlay')).toBeInTheDocument();
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

  it('renders analytics charts', async () => {
    (workflowsApi.listPending as any).mockResolvedValue({
      data: mockPendingItems,
    });

    render(<WorkflowDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Approval Times (Avg Hours)')).toBeInTheDocument();
      expect(screen.getByText('Bottlenecks (Pending Count)')).toBeInTheDocument();
      expect(screen.getByText('Completion Rates')).toBeInTheDocument();
    });
  });
});
